import json
import os
import hashlib
import secrets
import datetime
import random
import re
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${h}"


def verify_password(password: str, stored: str) -> bool:
    if not stored or "$" not in stored:
        return False
    salt, h = stored.split("$", 1)
    return hashlib.sha256((salt + password).encode()).hexdigest() == h


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 11 and digits[0] == "8":
        digits = "7" + digits[1:]
    if len(digits) == 10:
        digits = "7" + digits
    return "+" + digits if digits else ""


def gen_code() -> str:
    return f"{random.randint(0, 9999):04d}"


def gen_token() -> str:
    return secrets.token_urlsafe(32)


CONSENT_TEXT_VERSION = "capydoc-consent-offer-privacy-pep-v1"


def consent_text_hash() -> str:
    return hashlib.sha256(CONSENT_TEXT_VERSION.encode()).hexdigest()


def sms_text(purpose: str, code: str) -> str:
    # Имя отправителя (capydoc.ru) уже видно в заголовке SMS — в тексте не дублируем.
    if purpose == "register":
        return f"Kod podtverzhdeniya registracii: {code}. Deystvuet 10 minut."
    if purpose == "reset":
        return f"Kod dlya vosstanovleniya dostupa: {code}. Nikomu ne soobshchayte."
    return f"Kod dlya vhoda: {code}. Nikomu ne soobshchayte."


def send_sms(phone: str, text: str) -> dict:
    import urllib.request
    import urllib.parse
    api_id = os.environ.get("SMSRU_API_ID", "")
    to = re.sub(r"\D", "", phone or "")
    params = urllib.parse.urlencode({
        "api_id": api_id,
        "to": to,
        "msg": text,
        "from": "capydoc.ru",
        "json": 1,
    })
    url = f"https://sms.ru/sms/send?{params}"
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read().decode())
        print(f"[SMS.RU] to={to} status={data.get('status')} resp={data}")
        return data
    except Exception as e:
        print(f"[SMS.RU ERROR] to={to} err={e}")
        return {"status": "ERROR", "error": str(e)}


SMS_KINDS = {
    "login": "login",
    "register": "register",
    "reset": "reset",
    "sign": "sign",
}


def log_sms(cur, phone: str, user_id, kind: str, is_repeat: bool, ok: bool) -> None:
    """Записывает факт отправки SMS для счётчика расхода в кабинете Заведующей."""
    cur.execute(
        "INSERT INTO sms_log (phone, user_id, kind, is_repeat, status) VALUES (%s,%s,%s,%s,%s)",
        (phone, user_id, SMS_KINDS.get(kind, kind), is_repeat, "sent" if ok else "error")
    )


def is_repeat_sms(cur, phone: str, kind: str) -> bool:
    """Повтор — если по этому номеру и виду код уже отправляли за последние 30 минут."""
    cur.execute(
        "SELECT 1 FROM sms_log WHERE phone = %s AND kind = %s AND created_at > NOW() - INTERVAL '30 minutes' LIMIT 1",
        (phone, SMS_KINDS.get(kind, kind))
    )
    return cur.fetchone() is not None


def user_public(row, keys) -> dict:
    d = dict(zip(keys, row))
    d.pop("password_hash", None)
    for k in ("consent_at", "created_at", "last_login_at", "plan_expires_at", "trial_started_at"):
        if d.get(k):
            d[k] = str(d[k])
    return d


USER_COLS = ("id, phone, full_name, email, email_verified, login, role, consent_pep, profile_completed, status, "
             "plan, plan_expires_at, activity_description, trial_started_at, trial_purchased, trial_sends_used, trial_code_word")
USER_KEYS = ["id", "phone", "full_name", "email", "email_verified", "login", "role", "consent_pep", "profile_completed", "status",
             "plan", "plan_expires_at", "activity_description", "trial_started_at", "trial_purchased", "trial_sends_used", "trial_code_word"]


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, X-Device-Id",
        "Content-Type": "application/json",
    }


def resp(status, body):
    return {"statusCode": status, "headers": cors_headers(), "body": json.dumps(body, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    """Авторизация: регистрация по телефону+SMS, вход по логину/паролю, восстановление, доверенные устройства."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    if event.get("httpMethod") != "POST":
        return resp(405, {"error": "method not allowed"})

    body = json.loads(event.get("body") or "{}")
    action = body.get("action", "")
    headers = event.get("headers") or {}
    device_id = headers.get("x-device-id") or headers.get("X-Device-Id") or body.get("device_id") or ""

    def check_captcha_pass(cur, pass_token: str) -> bool:
        if not pass_token:
            return False
        cur.execute(
            "SELECT id FROM captcha_challenges WHERE pass_token = %s AND verified = TRUE AND used = FALSE AND expires_at > NOW()",
            (pass_token,)
        )
        row = cur.fetchone()
        if not row:
            return False
        cur.execute("UPDATE captcha_challenges SET used = TRUE WHERE id = %s", (row[0],))
        return True

    conn = get_conn()
    cur = conn.cursor()
    try:
        # 1. Запрос кода (на телефон или email)
        if action == "request_code":
            purpose = body.get("purpose", "login")  # login | reset | register
            channel = body.get("channel", "sms")    # sms | email
            phone = normalize_phone(body.get("phone", ""))
            email = (body.get("email") or "").strip().lower()

            if channel == "sms":
                if not check_captcha_pass(cur, body.get("captcha_pass_token", "")):
                    conn.rollback()
                    return resp(400, {"error": "Пройдите проверку «не робот»", "captcha_required": True})

            reg_email = None
            reg_password_hash = None
            reg_display_name = None
            reg_activity = None
            consent_personal = False
            consent_offer = False
            consent_pep = False

            user_id = None
            if channel == "sms":
                if not phone:
                    return resp(400, {"error": "Введите номер телефона"})
                cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
                r = cur.fetchone()
                user_id = r[0] if r else None
                if purpose == "reset" and not user_id:
                    return resp(404, {"error": "Аккаунт с таким номером не найден"})

                # Регистрация нового пользователя: телефон+email+пароль+согласие,
                # аккаунт создастся ТОЛЬКО после подтверждения кода из SMS
                if purpose == "register":
                    if user_id:
                        return resp(409, {"error": "Аккаунт с таким номером уже существует"})
                    reg_email = (body.get("email") or "").strip().lower()
                    reg_display_name = (body.get("display_name") or "").strip()[:120]
                    reg_activity = (body.get("activity_description") or "").strip()[:500]
                    password = body.get("password") or ""
                    # Три документа принимаются по отдельности. Старый флаг consent
                    # оставляем для совместимости: если пришёл только он — считаем все три принятыми.
                    legacy_consent = bool(body.get("consent"))
                    consent_personal = bool(body.get("consent_personal", legacy_consent))
                    consent_offer = bool(body.get("consent_offer", legacy_consent))
                    consent_pep = bool(body.get("consent_pep", legacy_consent))
                    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", reg_email):
                        return resp(400, {"error": "Введите корректный email"})
                    if not re.match(r"^[A-Za-z0-9!-/:-@\[-`{-~]{6,20}$", password):
                        return resp(400, {"error": "Пароль: латиница, цифры и знаки, от 6 до 20 символов"})
                    if not consent_personal:
                        return resp(400, {"error": "Нужно согласие на обработку персональных данных"})
                    if not consent_offer:
                        return resp(400, {"error": "Нужно принять публичную оферту"})
                    if not consent_pep:
                        return resp(400, {"error": "Нужно принять соглашение об использовании ПЭП"})
                    cur.execute("SELECT id FROM users WHERE email = %s", (reg_email,))
                    if cur.fetchone():
                        return resp(409, {"error": "Аккаунт с таким email уже существует"})
                    reg_password_hash = hash_password(password)
            else:
                if not email:
                    return resp(400, {"error": "Введите email"})
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                r = cur.fetchone()
                user_id = r[0] if r else None
                if purpose == "reset" and not user_id:
                    return resp(404, {"error": "Аккаунт с таким email не найден"})

            # Пауза 60 секунд между повторными отправками кода на один и тот же адрес
            if channel == "sms":
                cur.execute(
                    "SELECT created_at FROM auth_codes WHERE phone = %s AND purpose = %s AND channel = 'sms' ORDER BY created_at DESC LIMIT 1",
                    (phone, purpose)
                )
            else:
                cur.execute(
                    "SELECT created_at FROM auth_codes WHERE email = %s AND purpose = %s AND channel = 'email' ORDER BY created_at DESC LIMIT 1",
                    (email, purpose)
                )
            last = cur.fetchone()
            if last and last[0]:
                elapsed = (datetime.datetime.utcnow() - last[0]).total_seconds()
                if elapsed < 60:
                    wait = int(60 - elapsed)
                    return resp(429, {"error": f"Подождите {wait} сек перед повторной отправкой", "retry_after": wait})

            # Лимиты отправки SMS на один номер
            if channel == "sms":
                # Суточный лимит SMS: для входа — 6 (до 2 устройств), иначе — 3.
                # По достижении лимита — блокировка отправки на сутки.
                day_limit = 6 if purpose == "login" else 3
                cur.execute(
                    "SELECT COUNT(*), MIN(created_at) FROM auth_codes WHERE phone = %s AND channel = 'sms' AND created_at > NOW() - INTERVAL '24 hours'",
                    (phone,)
                )
                day = cur.fetchone()
                day_count = day[0] or 0
                if day_count >= day_limit and day[1]:
                    elapsed = (datetime.datetime.utcnow() - day[1]).total_seconds()
                    wait = int(24 * 3600 - elapsed)
                    if wait > 0:
                        hours = (wait + 3599) // 3600
                        return resp(429, {
                            "error": f"Превышен суточный лимит SMS ({day_limit}). Отправка заблокирована на {hours} ч.",
                            "limited": True,
                            "retry_after": wait,
                        })

                # 3 отправки за 30 минут → пауза 30 минут
                cur.execute(
                    "SELECT COUNT(*), MIN(created_at) FROM auth_codes WHERE phone = %s AND channel = 'sms' AND created_at > NOW() - INTERVAL '30 minutes'",
                    (phone,)
                )
                win = cur.fetchone()
                win_count = win[0] or 0
                if win_count >= 3 and win[1]:
                    elapsed = (datetime.datetime.utcnow() - win[1]).total_seconds()
                    wait = int(30 * 60 - elapsed)
                    if wait > 0:
                        mins = (wait + 59) // 60
                        return resp(429, {
                            "error": f"Слишком много запросов кода. Отправка заблокирована на {mins} мин.",
                            "limited": True,
                            "retry_after": wait,
                        })

            code = gen_code()
            expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            cur.execute(
                "INSERT INTO auth_codes (user_id, phone, email, code, purpose, channel, expires_at, reg_email, reg_password_hash, "
                "reg_display_name, reg_activity, consent_personal, consent_offer, consent_pep) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (user_id, phone or None, email or None, code, purpose, channel, expires, reg_email, reg_password_hash,
                 reg_display_name, reg_activity, consent_personal, consent_offer, consent_pep)
            )
            conn.commit()
            print(f"[AUTH CODE] purpose={purpose} channel={channel} phone={phone} email={email} CODE={code}")

            if channel == "sms":
                repeat = is_repeat_sms(cur, phone, purpose)
                sms_res = send_sms(phone, sms_text(purpose, code))
                ok = sms_res.get("status") == "OK"
                log_sms(cur, phone, user_id, purpose, repeat, ok)
                conn.commit()
                if not ok:
                    return resp(502, {"error": "Не удалось отправить SMS. Попробуйте позже.", "sms_status": sms_res.get("status")})
                return resp(200, {"ok": True, "sent": True, "channel": channel})

            return resp(200, {"ok": True, "sent": True, "channel": channel, "dev_code": code})

        # 2. Проверка кода — вход/регистрация по телефону, либо подтверждение reset
        if action == "verify_code":
            purpose = body.get("purpose", "login")
            channel = body.get("channel", "sms")
            phone = normalize_phone(body.get("phone", ""))
            email = (body.get("email") or "").strip().lower()
            code = (body.get("code") or "").strip()

            ident = phone if channel == "sms" else email
            if not ident:
                return resp(400, {"error": "Введите номер телефона" if channel == "sms" else "Введите email"})
            if not code:
                return resp(400, {"error": "Введите код из сообщения"})

            # Блокировка: 3 неверных ввода кода → блок на 30 минут
            cur.execute(
                "SELECT COUNT(*), MAX(created_at) FROM auth_attempts "
                "WHERE identifier = %s AND success = FALSE AND created_at > NOW() - INTERVAL '30 minutes'",
                (ident,)
            )
            att = cur.fetchone()
            fail_count = att[0] or 0
            if fail_count >= 3 and att[1]:
                elapsed = (datetime.datetime.utcnow() - att[1]).total_seconds()
                wait = int(30 * 60 - elapsed)
                if wait > 0:
                    mins = (wait + 59) // 60
                    return resp(429, {
                        "error": f"Слишком много неверных попыток. Вход заблокирован на {mins} мин.",
                        "locked": True,
                        "retry_after": wait,
                    })

            if channel == "sms":
                cur.execute(
                    "SELECT id, code, reg_email, reg_password_hash, consent_personal, consent_offer, consent_pep, reg_display_name, reg_activity "
                    "FROM auth_codes WHERE phone = %s AND purpose = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                    (phone, purpose)
                )
            else:
                cur.execute(
                    "SELECT id, code, reg_email, reg_password_hash, consent_personal, consent_offer, consent_pep, reg_display_name, reg_activity "
                    "FROM auth_codes WHERE email = %s AND purpose = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                    (email, purpose)
                )
            row = cur.fetchone()
            if not row or row[1] != code:
                cur.execute(
                    "INSERT INTO auth_attempts (identifier, success) VALUES (%s, FALSE)",
                    (ident,)
                )
                conn.commit()
                left = 3 - (fail_count + 1)
                if left <= 0:
                    return resp(429, {
                        "error": "Слишком много неверных попыток. Вход заблокирован на 30 мин.",
                        "locked": True,
                        "retry_after": 30 * 60,
                    })
                return resp(400, {"error": f"Неверный или просроченный код. Осталось попыток: {left}"})

            cur.execute("DELETE FROM auth_attempts WHERE identifier = %s", (ident,))
            reg_email = row[2]
            reg_password_hash = row[3]
            ok_personal = bool(row[4])
            ok_offer = bool(row[5])
            ok_pep = bool(row[6])
            reg_display_name = row[7] if len(row) > 7 else None
            reg_activity = row[8] if len(row) > 8 else None
            cur.execute("UPDATE auth_codes SET used = TRUE WHERE id = %s", (row[0],))

            # Находим или создаём пользователя
            if channel == "sms":
                cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
                ex = cur.fetchone()
                if ex:
                    uid = ex[0]
                    cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (uid,))
                elif purpose == "register" and reg_email and reg_password_hash:
                    # Аккаунт создаётся ТОЛЬКО сейчас — после подтверждения кода из SMS
                    cur.execute("SELECT id FROM users WHERE email = %s", (reg_email,))
                    if cur.fetchone():
                        return resp(409, {"error": "Аккаунт с таким email уже существует"})
                    cur.execute(
                        "INSERT INTO users (phone, email, login, password_hash, full_name, activity_description, consent_pep, consent_at, "
                        "consent_personal, consent_personal_at, consent_offer, consent_offer_at, last_login_at, created_at) "
                        "VALUES (%s, %s, %s, %s, %s, %s, TRUE, NOW(), TRUE, NOW(), TRUE, NOW(), NOW(), NOW()) RETURNING id",
                        (phone, reg_email, reg_email, reg_password_hash, reg_display_name or None, reg_activity or None)
                    )
                    uid = cur.fetchone()[0]
                    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "")
                    ua = headers.get("user-agent", "")
                    text_hash = consent_text_hash()
                    cur.execute(
                        "INSERT INTO document_signatures "
                        "(subject_type, signer_user_id, signer_role, signer_phone, auth_code_id, code, signed_at, ip_address, user_agent, consent_text_hash) "
                        "VALUES ('consent_pep', %s, 'client', %s, %s, %s, NOW(), %s, %s, %s)",
                        (uid, phone, row[0], code, ip, ua, text_hash)
                    )
                    # Каждый из трёх документов фиксируем отдельной записью в журнале согласий
                    for doc_type, accepted in (
                        ("personal_data", ok_personal),
                        ("offer", ok_offer),
                        ("pep", ok_pep),
                    ):
                        cur.execute(
                            "INSERT INTO user_consents "
                            "(user_id, doc_type, accepted, accepted_at, phone, auth_code_id, code, ip_address, user_agent, consent_text_hash) "
                            "VALUES (%s, %s, %s, NOW(), %s, %s, %s, %s, %s, %s)",
                            (uid, doc_type, accepted, phone, row[0], code, ip, ua, text_hash)
                        )
                else:
                    cur.execute(
                        "INSERT INTO users (phone, consent_pep, consent_at, last_login_at, created_at) VALUES (%s, TRUE, NOW(), NOW(), NOW()) RETURNING id",
                        (phone,)
                    )
                    uid = cur.fetchone()[0]
            else:
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                ex = cur.fetchone()
                if not ex:
                    return resp(404, {"error": "Аккаунт не найден"})
                uid = ex[0]
                if purpose == "verify_email":
                    cur.execute("UPDATE users SET email_verified = TRUE WHERE id = %s", (uid,))

            # Регистрируем доверенное устройство
            if device_id:
                cur.execute(
                    "INSERT INTO user_devices (user_id, device_id, user_agent) VALUES (%s,%s,%s) "
                    "ON CONFLICT (user_id, device_id) DO UPDATE SET last_seen_at = NOW(), trusted = TRUE",
                    (uid, device_id, headers.get("user-agent", ""))
                )

            token = gen_token()
            cur.execute(
                "INSERT INTO user_sessions (user_id, token, device_id, expires_at) VALUES (%s,%s,%s, NOW() + INTERVAL '90 days')",
                (uid, token, device_id or None)
            )
            cur.execute(f"SELECT {USER_COLS}, password_hash FROM users WHERE id = %s", (uid,))
            urow = cur.fetchone()
            user = user_public(urow, USER_KEYS + ["password_hash"])
            conn.commit()

            # reset: разрешаем установить новый пароль этим же токеном
            return resp(200, {"ok": True, "token": token, "user": user})

        # 3. Вход по логину/паролю
        if action == "login_password":
            login = (body.get("login") or "").strip()
            password = body.get("password") or ""
            cur.execute(
                f"SELECT {USER_COLS}, password_hash FROM users WHERE login = %s OR phone = %s OR email = %s",
                (login, normalize_phone(login), login.lower())
            )
            urow = cur.fetchone()
            if not urow:
                return resp(404, {"error": "Пользователь не найден"})
            keys = USER_KEYS + ["password_hash"]
            d = dict(zip(keys, urow))
            uid = d["id"]

            # Заведующая: с нового устройства первый вход только после кода из SMS
            if d.get("role") == "admin":
                if not (d.get("password_hash") or ""):
                    # Пароль ещё не задан — назначаем введённый
                    if not re.match(r"^[A-Za-z0-9!-/:-@\[-`{-~]{6,20}$", password):
                        return resp(400, {"error": "Придумайте пароль: латиница, цифры и знаки, от 6 символов"})
                    cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(password), uid))
                    conn.commit()
                elif not verify_password(password, d.get("password_hash") or ""):
                    return resp(401, {"error": "Неверный логин или пароль"})
                trusted = False
                if device_id:
                    cur.execute(
                        "SELECT trusted FROM user_devices WHERE user_id = %s AND device_id = %s",
                        (uid, device_id)
                    )
                    dev = cur.fetchone()
                    trusted = bool(dev and dev[0])
                if not trusted:
                    admin_phone = d.get("phone") or ""
                    if not admin_phone:
                        return resp(400, {"error": "У аккаунта Заведующей не указан телефон"})
                    code = gen_code()
                    expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
                    cur.execute(
                        "INSERT INTO auth_codes (user_id, phone, code, purpose, channel, expires_at) "
                        "VALUES (%s,%s,%s,'login','sms',%s)",
                        (uid, admin_phone, code, expires)
                    )
                    repeat = is_repeat_sms(cur, admin_phone, "login")
                    sms_res = send_sms(admin_phone, sms_text("login", code))
                    ok_sms = sms_res.get("status") == "OK"
                    log_sms(cur, admin_phone, uid, "login", repeat, ok_sms)
                    conn.commit()
                    if not ok_sms:
                        return resp(502, {"error": "Не удалось отправить SMS. Попробуйте позже."})
                    masked = admin_phone[:2] + "*" * max(0, len(admin_phone) - 6) + admin_phone[-4:]
                    return resp(200, {
                        "ok": True,
                        "sms_required": True,
                        "phone": admin_phone,
                        "phone_masked": masked,
                    })
            # Первый вход (пароль ещё не задан) — назначаем введённый пароль
            if not (d.get("password_hash") or ""):
                if len(password) < 6:
                    return resp(400, {"error": "Придумайте пароль не короче 6 символов"})
                cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(password), uid))
            elif not verify_password(password, d.get("password_hash") or ""):
                return resp(401, {"error": "Неверный логин или пароль"})
            cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (uid,))
            if device_id:
                cur.execute(
                    "INSERT INTO user_devices (user_id, device_id, user_agent) VALUES (%s,%s,%s) "
                    "ON CONFLICT (user_id, device_id) DO UPDATE SET last_seen_at = NOW()",
                    (uid, device_id, headers.get("user-agent", ""))
                )
            token = gen_token()
            cur.execute(
                "INSERT INTO user_sessions (user_id, token, device_id, expires_at) VALUES (%s,%s,%s, NOW() + INTERVAL '90 days')",
                (uid, token, device_id or None)
            )
            conn.commit()
            return resp(200, {"ok": True, "token": token, "user": user_public(urow, keys)})

        # 4. Проверка: доверенное ли устройство (нужен ли SMS)
        if action == "check_device":
            phone = normalize_phone(body.get("phone", ""))
            cur.execute("SELECT id, login, password_hash FROM users WHERE phone = %s", (phone,))
            r = cur.fetchone()
            if not r:
                return resp(200, {"exists": False, "trusted": False, "has_password": False})
            uid, login, pwd = r
            trusted = False
            if device_id:
                cur.execute("SELECT trusted FROM user_devices WHERE user_id = %s AND device_id = %s", (uid, device_id))
                d = cur.fetchone()
                trusted = bool(d and d[0])
            return resp(200, {"exists": True, "trusted": trusted, "has_password": bool(pwd), "has_login": bool(login)})

        # 5. Получить текущего пользователя по токену
        if action == "me":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute("SELECT user_id FROM user_sessions WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())", (token,))
            s = cur.fetchone()
            if not s:
                return resp(401, {"error": "Сессия истекла"})
            cur.execute(f"SELECT {USER_COLS} FROM users WHERE id = %s", (s[0],))
            urow = cur.fetchone()
            user = user_public(urow, USER_KEYS)
            cur.execute("SELECT status FROM family_requests WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (s[0],))
            fr = cur.fetchone()
            user["family_request_status"] = fr[0] if fr else None
            return resp(200, {"ok": True, "user": user})

        # 6. Обновить профиль (ФИО, email, логин, пароль)
        if action == "update_profile":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute("SELECT user_id FROM user_sessions WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())", (token,))
            s = cur.fetchone()
            if not s:
                return resp(401, {"error": "Сессия истекла"})
            uid = s[0]

            full_name = body.get("full_name")
            email = (body.get("email") or "").strip().lower() if "email" in body else None
            login = (body.get("login") or "").strip() if "login" in body else None
            password = body.get("password")

            if login:
                cur.execute("SELECT id FROM users WHERE login = %s AND id <> %s", (login, uid))
                if cur.fetchone():
                    return resp(409, {"error": "Этот логин уже занят"})
            if email:
                cur.execute("SELECT id FROM users WHERE email = %s AND id <> %s", (email, uid))
                if cur.fetchone():
                    return resp(409, {"error": "Этот email уже используется"})

            sets = ["profile_completed = TRUE"]
            params = []
            if full_name is not None:
                sets.append("full_name = %s")
                params.append(full_name)
            if "activity_description" in body:
                sets.append("activity_description = %s")
                params.append((body.get("activity_description") or "").strip()[:500] or None)
            if "email" in body:
                sets.append("email = %s")
                params.append(email)
            if "login" in body:
                sets.append("login = %s")
                params.append(login)
            if password:
                if not re.match(r"^[A-Za-z0-9!-/:-@\[-`{-~]{6,20}$", password):
                    return resp(400, {"error": "Пароль: латиница, цифры и знаки, от 6 до 20 символов"})
                sets.append("password_hash = %s")
                params.append(hash_password(password))
            params.append(uid)
            cur.execute(f"UPDATE users SET {', '.join(sets)} WHERE id = %s", params)
            cur.execute(f"SELECT {USER_COLS} FROM users WHERE id = %s", (uid,))
            urow = cur.fetchone()
            conn.commit()
            return resp(200, {"ok": True, "user": user_public(urow, USER_KEYS)})

        # 7. Сброс пароля (после verify_code с purpose=reset вернётся token)
        if action == "reset_password":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            password = body.get("password") or ""
            if not re.match(r"^[A-Za-z0-9!-/:-@\[-`{-~]{6,20}$", password):
                return resp(400, {"error": "Пароль: латиница, цифры и знаки, от 6 символов"})
            cur.execute("SELECT user_id FROM user_sessions WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())", (token,))
            s = cur.fetchone()
            if not s:
                return resp(401, {"error": "Сессия истекла"})
            cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(password), s[0]))
            conn.commit()
            return resp(200, {"ok": True})

        # 8. Заявка на бесплатный тариф «Для родных» по кодовому слову — модерирует администратор
        if action == "request_family_plan":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            code_word = (body.get("code_word") or "").strip()
            if not code_word:
                return resp(400, {"error": "Введите кодовое слово"})
            cur.execute("SELECT user_id FROM user_sessions WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())", (token,))
            s = cur.fetchone()
            if not s:
                return resp(401, {"error": "Сессия истекла"})
            uid = s[0]
            cur.execute("SELECT code_word, expires_at FROM family_code_settings WHERE id = 1")
            cw = cur.fetchone()
            if not cw or not cw[0]:
                return resp(400, {"error": "Кодовое слово пока не назначено"})
            if cw[1] and cw[1] < datetime.datetime.utcnow():
                return resp(400, {"error": "Срок действия кодового слова истёк"})
            if code_word.strip().lower() != (cw[0] or "").strip().lower():
                return resp(400, {"error": "Неверное кодовое слово"})
            cur.execute("SELECT id FROM family_requests WHERE user_id = %s AND status = 'pending'", (uid,))
            if cur.fetchone():
                return resp(409, {"error": "Заявка уже отправлена, ожидайте подтверждения"})
            cur.execute("INSERT INTO family_requests (user_id, code_word) VALUES (%s, %s)", (uid, code_word))
            conn.commit()
            return resp(200, {"ok": True})

        # 8.1 Активация тестового тарифа по кодовому слову (разовое применение на пользователя)
        if action == "redeem_trial_code":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            code_word = (body.get("code_word") or "").strip()
            if not code_word:
                return resp(400, {"error": "Введите кодовое слово"})
            cur.execute("SELECT user_id FROM user_sessions WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())", (token,))
            s = cur.fetchone()
            if not s:
                return resp(401, {"error": "Сессия истекла"})
            uid = s[0]
            cur.execute("SELECT trial_started_at FROM users WHERE id = %s", (uid,))
            urow = cur.fetchone()
            if urow and urow[0]:
                return resp(409, {"error": "Тестовый тариф уже был использован на этом аккаунте"})
            cur.execute("SELECT code_word, expires_at FROM trial_codes WHERE lower(code_word) = lower(%s)", (code_word,))
            tc = cur.fetchone()
            if not tc:
                return resp(400, {"error": "Неверное кодовое слово"})
            if tc[1] and tc[1] < datetime.datetime.utcnow():
                return resp(400, {"error": "Срок действия кодового слова истёк"})
            cur.execute(
                "UPDATE users SET plan = 'trial', plan_expires_at = NOW() + INTERVAL '3 days', "
                "trial_started_at = NOW(), trial_code_word = %s WHERE id = %s",
                (tc[0], uid)
            )
            conn.commit()
            cur.execute(f"SELECT {USER_COLS} FROM users WHERE id = %s", (uid,))
            urow2 = cur.fetchone()
            return resp(200, {"ok": True, "user": user_public(urow2, USER_KEYS)})

        # 8.2 Админ: список кодовых слов тестового тарифа
        if action == "admin_list_trial_codes":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute(
                "SELECT tc.id, tc.code_word, tc.expires_at, tc.created_at, "
                "(SELECT COUNT(*) FROM users u WHERE u.trial_code_word = tc.code_word), "
                "tc.partner_user_id, au.full_name, au.phone "
                "FROM trial_codes tc LEFT JOIN users au ON au.id = tc.partner_user_id "
                "ORDER BY tc.created_at DESC"
            )
            items = [
                {"id": r[0], "code_word": r[1], "expires_at": str(r[2]) if r[2] else None,
                 "created_at": str(r[3]) if r[3] else None, "used_count": r[4] or 0,
                 "anchor_user_id": r[5], "anchor_name": r[6], "anchor_phone": r[7]}
                for r in cur.fetchall()
            ]
            return resp(200, {"ok": True, "items": items})

        # 8.3 Админ: создать новое кодовое слово тестового тарифа
        if action == "admin_create_trial_code":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            code_word = (body.get("code_word") or "").strip()
            expires_at = (body.get("expires_at") or "").strip() or None
            if not code_word:
                return resp(400, {"error": "Введите кодовое слово"})
            cur.execute("SELECT id FROM trial_codes WHERE lower(code_word) = lower(%s)", (code_word,))
            if cur.fetchone():
                return resp(409, {"error": "Такое кодовое слово уже существует"})
            cur.execute(
                "INSERT INTO trial_codes (code_word, expires_at) VALUES (%s, %s) RETURNING id",
                (code_word, expires_at)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {"ok": True, "id": new_id})

        # 8.4 Админ: удалить кодовое слово тестового тарифа
        if action == "admin_delete_trial_code":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute("DELETE FROM trial_codes WHERE id = %s", (body.get("id"),))
            conn.commit()
            return resp(200, {"ok": True})

        # 8.5 Админ: поиск среди уже зарегистрированных пользователей (для прикрепления к кодовому слову)
        if action == "admin_search_users":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            q = (body.get("q") or "").strip()
            if len(q) < 2:
                return resp(200, {"ok": True, "items": []})
            digits = re.sub(r"\D", "", q)
            like = f"%{q.lower()}%"
            if digits:
                cur.execute(
                    "SELECT id, full_name, phone, email FROM users "
                    "WHERE phone LIKE %s OR lower(full_name) LIKE %s OR lower(email) LIKE %s "
                    "ORDER BY created_at DESC LIMIT 20",
                    (f"%{digits}%", like, like)
                )
            else:
                cur.execute(
                    "SELECT id, full_name, phone, email FROM users "
                    "WHERE lower(full_name) LIKE %s OR lower(email) LIKE %s "
                    "ORDER BY created_at DESC LIMIT 20",
                    (like, like)
                )
            items = [{"id": r[0], "full_name": r[1], "phone": r[2], "email": r[3]} for r in cur.fetchall()]
            return resp(200, {"ok": True, "items": items})

        # 8.6 Админ: прикрепить зарегистрированного пользователя к кодовому слову (все, кто войдёт
        # по этому слову дальше, будут считаться привязанными к этому же пользователю)
        if action == "admin_attach_code_user":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            code_id = body.get("code_id")
            user_id = body.get("user_id")
            if not code_id or not user_id:
                return resp(400, {"error": "Не указан код или пользователь"})
            cur.execute("SELECT id FROM trial_codes WHERE id = %s", (code_id,))
            if not cur.fetchone():
                return resp(404, {"error": "Кодовое слово не найдено"})
            cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cur.fetchone():
                return resp(404, {"error": "Пользователь не найден"})
            cur.execute("SELECT id FROM trial_codes WHERE partner_user_id = %s AND id != %s", (user_id, code_id))
            if cur.fetchone():
                return resp(409, {"error": "Этот пользователь уже прикреплён к другому кодовому слову"})
            cur.execute("UPDATE trial_codes SET partner_user_id = %s WHERE id = %s", (user_id, code_id))
            conn.commit()
            return resp(200, {"ok": True})

        # 8.7 Админ: открепить пользователя от кодового слова
        if action == "admin_detach_code_user":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            code_id = body.get("code_id")
            cur.execute("UPDATE trial_codes SET partner_user_id = NULL WHERE id = %s", (code_id,))
            conn.commit()
            return resp(200, {"ok": True})

        # 8.8 Админ: список пользователей, вошедших по кодовому слову (прикреплённых к тому же человеку)
        if action == "admin_code_referrals":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            code_id = body.get("code_id")
            if not code_id:
                return resp(400, {"error": "Не указано кодовое слово"})
            cur.execute("SELECT code_word, partner_user_id FROM trial_codes WHERE id = %s", (code_id,))
            tc = cur.fetchone()
            if not tc:
                return resp(404, {"error": "Кодовое слово не найдено"})
            code_word, anchor_id = tc
            cur.execute(
                "SELECT id, full_name, phone, email, plan, plan_expires_at, created_at "
                "FROM users WHERE trial_code_word = %s AND id != COALESCE(%s, 0) ORDER BY created_at DESC",
                (code_word, anchor_id)
            )
            items = [
                {"id": r[0], "full_name": r[1], "phone": r[2], "email": r[3],
                 "plan": r[4], "plan_expires_at": str(r[5]) if r[5] else None,
                 "created_at": str(r[6]) if r[6] else None}
                for r in cur.fetchall()
            ]
            return resp(200, {"ok": True, "code_word": code_word, "items": items})

        # 8.0 Заведующая: код в SMS — вход с нового устройства или восстановление пароля
        if action == "admin_request_sms":
            admin_phone = normalize_phone(body.get("phone", ""))
            purpose = body.get("purpose", "login")
            if purpose not in ("login", "reset"):
                purpose = "login"
            cur.execute("SELECT id, role FROM users WHERE phone = %s", (admin_phone,))
            r = cur.fetchone()
            if not r or r[1] != "admin":
                return resp(403, {"error": "Этот номер не принадлежит Заведующей"})
            uid = r[0]
            cur.execute(
                "SELECT created_at FROM auth_codes WHERE phone = %s AND purpose = %s AND channel = 'sms' "
                "ORDER BY created_at DESC LIMIT 1",
                (admin_phone, purpose)
            )
            last = cur.fetchone()
            if last and last[0]:
                elapsed = (datetime.datetime.utcnow() - last[0]).total_seconds()
                if elapsed < 60:
                    wait = int(60 - elapsed)
                    return resp(429, {"error": f"Подождите {wait} сек перед повторной отправкой"})
            code = gen_code()
            expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            cur.execute(
                "INSERT INTO auth_codes (user_id, phone, code, purpose, channel, expires_at) "
                "VALUES (%s,%s,%s,%s,'sms',%s)",
                (uid, admin_phone, code, purpose, expires)
            )
            repeat = is_repeat_sms(cur, admin_phone, purpose)
            sms_res = send_sms(admin_phone, sms_text(purpose, code))
            ok_sms = sms_res.get("status") == "OK"
            log_sms(cur, admin_phone, uid, purpose, repeat, ok_sms)
            conn.commit()
            if not ok_sms:
                return resp(502, {"error": "Не удалось отправить SMS. Попробуйте позже."})
            return resp(200, {"ok": True, "sent": True, "phone": admin_phone, "purpose": purpose})

        # 8.03 Админ: реальный список пользователей со статистикой
        # Акция «12 шаблонов»: кому досталось место и что человек попросил
        if action == "admin_promo_slots":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute(
                "SELECT p.slot_number, p.status, p.request_text, p.created_at, p.done_at, "
                "u.full_name, u.phone, u.email "
                "FROM promo_template_slots p JOIN users u ON u.id = p.user_id "
                "ORDER BY p.slot_number"
            )
            slots = [
                {
                    "slot": r[0], "status": r[1], "request_text": r[2],
                    "created_at": str(r[3]) if r[3] else None,
                    "done_at": str(r[4]) if r[4] else None,
                    "full_name": r[5], "phone": r[6], "email": r[7],
                }
                for r in cur.fetchall()
            ]
            return resp(200, {"ok": True, "slots": slots, "total": 12, "left": max(0, 12 - len(slots))})

        # Анкеты на разработку шаблонов (акция «12 шаблонов»)
        if action == "admin_template_briefs":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute(
                "SELECT b.id, b.answers, b.sample_file_url, b.sample_notes, b.status, b.created_at, "
                "p.slot_number, u.full_name, u.phone, u.email "
                "FROM template_briefs b "
                "LEFT JOIN promo_template_slots p ON p.id = b.slot_id "
                "JOIN users u ON u.id = b.user_id "
                "ORDER BY b.created_at DESC LIMIT 100"
            )
            briefs = []
            for r in cur.fetchall():
                ans = r[1]
                if isinstance(ans, str):
                    try:
                        ans = json.loads(ans)
                    except (ValueError, TypeError):
                        ans = {}
                briefs.append({
                    "id": r[0], "answers": ans or {}, "file_url": r[2], "notes": r[3],
                    "status": r[4], "created_at": str(r[5]) if r[5] else None,
                    "slot": r[6], "full_name": r[7], "phone": r[8], "email": r[9],
                })
            return resp(200, {"ok": True, "briefs": briefs})

        if action == "admin_list_users":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute(
                "SELECT u.id, u.full_name, u.phone, u.email, u.plan, u.plan_expires_at, u.role, "
                "u.created_at, u.last_login_at, u.activity_description, "
                "(SELECT COUNT(*) FROM contracts c WHERE c.user_id = u.id "
                "  AND c.status NOT IN ('deleted','archived_test')), "
                "(SELECT COUNT(*) FROM contracts c WHERE c.user_id = u.id AND c.signed_at IS NOT NULL "
                "  AND c.status NOT IN ('deleted','archived_test')), "
                "(SELECT COUNT(*) FROM invoices i WHERE i.user_id = u.id "
                "  AND i.status NOT IN ('deleted','archived_test')), "
                "u.trial_code_word "
                "FROM users u WHERE u.is_test = FALSE ORDER BY u.created_at DESC LIMIT 300"
            )
            users = [
                {
                    "id": r[0], "full_name": r[1], "phone": r[2], "email": r[3],
                    "plan": r[4], "plan_expires_at": str(r[5]) if r[5] else None, "role": r[6],
                    "created_at": str(r[7]) if r[7] else None,
                    "last_login_at": str(r[8]) if r[8] else None,
                    "activity_description": r[9],
                    "docs_total": r[10] or 0, "docs_signed": r[11] or 0, "invoices": r[12] or 0,
                    "trial_code_word": r[13],
                }
                for r in cur.fetchall()
            ]
            paid = sum(1 for u in users if u["plan"] and u["role"] != "admin")
            return resp(200, {"ok": True, "users": users, "total": len(users), "paid": paid,
                              "docs": sum(u["docs_total"] for u in users),
                              "signed": sum(u["docs_signed"] for u in users)})

        # 8.04 Поддержка: обращения пользователей
        if action == "support_create":
            message = (body.get("message") or "").strip()
            if len(message) < 5:
                return resp(400, {"error": "Опишите вопрос подробнее"})
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or ""
            uid = None
            if token:
                cur.execute(
                    "SELECT user_id FROM user_sessions WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())",
                    (token,)
                )
                r = cur.fetchone()
                uid = r[0] if r else None
            cur.execute(
                "INSERT INTO support_tickets (user_id, name, phone, email, message, topic) "
                "VALUES (%s,%s,%s,%s,%s,%s)",
                (uid, (body.get("name") or "")[:200], normalize_phone(body.get("phone") or ""),
                 (body.get("email") or "")[:200], message[:4000],
                 ((body.get("topic") or "").strip() or None))
            )
            conn.commit()
            return resp(200, {"ok": True})

        if action == "admin_list_tickets":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute(
                "SELECT t.id, COALESCE(NULLIF(t.name,''), u.full_name), COALESCE(NULLIF(t.phone,''), u.phone), "
                "t.email, t.message, t.answer, t.answered_at, t.created_at, t.topic "
                "FROM support_tickets t LEFT JOIN users u ON u.id = t.user_id "
                "ORDER BY t.answered_at IS NOT NULL, t.created_at DESC LIMIT 200"
            )
            tickets = [
                {"id": r[0], "name": r[1], "phone": r[2], "email": r[3], "message": r[4],
                 "answer": r[5], "answered_at": str(r[6]) if r[6] else None,
                 "created_at": str(r[7]) if r[7] else None, "topic": r[8]}
                for r in cur.fetchall()
            ]
            return resp(200, {"ok": True, "tickets": tickets,
                              "new_count": sum(1 for t in tickets if not t["answered_at"])})

        if action == "admin_answer_ticket":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            tid = body.get("id")
            answer = (body.get("answer") or "").strip()
            if not tid or not answer:
                return resp(400, {"error": "Укажите обращение и ответ"})
            cur.execute(
                "UPDATE support_tickets SET answer = %s, answered_at = NOW() WHERE id = %s",
                (answer[:4000], int(tid))
            )
            conn.commit()
            return resp(200, {"ok": True})

        # 8.05 Админ: расход SMS по видам и по номерам
        if action == "admin_sms_stats":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            days = body.get("days")
            days = int(days) if str(days).isdigit() and 0 < int(days) <= 365 else 30
            where = f"created_at > NOW() - INTERVAL '{days} days' AND status = 'sent'"
            where_l = f"l.created_at > NOW() - INTERVAL '{days} days' AND l.status = 'sent'"

            cur.execute(f"SELECT kind, is_repeat, COUNT(*) FROM sms_log WHERE {where} GROUP BY kind, is_repeat")
            by_kind = [{"kind": r[0], "is_repeat": bool(r[1]), "count": r[2]} for r in cur.fetchall()]

            cur.execute(f"SELECT COUNT(*) FROM sms_log WHERE {where}")
            total = cur.fetchone()[0] or 0

            cur.execute(f"SELECT COUNT(*) FROM sms_log WHERE {where} AND created_at > NOW() - INTERVAL '1 day'")
            today = cur.fetchone()[0] or 0

            cur.execute(
                f"SELECT l.phone, MAX(u.full_name), COUNT(*), "
                f"SUM(CASE WHEN l.kind = 'login' AND NOT l.is_repeat THEN 1 ELSE 0 END), "
                f"SUM(CASE WHEN l.kind = 'login' AND l.is_repeat THEN 1 ELSE 0 END), "
                f"SUM(CASE WHEN l.kind = 'reset' AND NOT l.is_repeat THEN 1 ELSE 0 END), "
                f"SUM(CASE WHEN l.kind = 'reset' AND l.is_repeat THEN 1 ELSE 0 END), "
                f"SUM(CASE WHEN l.kind = 'sign' AND NOT l.is_repeat THEN 1 ELSE 0 END), "
                f"SUM(CASE WHEN l.kind = 'sign' AND l.is_repeat THEN 1 ELSE 0 END), "
                f"SUM(CASE WHEN l.kind = 'register' THEN 1 ELSE 0 END), MAX(l.created_at) "
                f"FROM sms_log l LEFT JOIN users u ON u.id = l.user_id WHERE {where_l} "
                f"GROUP BY l.phone ORDER BY COUNT(*) DESC LIMIT 200"
            )
            by_phone = [
                {
                    "phone": r[0], "full_name": r[1], "total": r[2],
                    "login": r[3] or 0, "login_repeat": r[4] or 0,
                    "reset": r[5] or 0, "reset_repeat": r[6] or 0,
                    "sign": r[7] or 0, "sign_repeat": r[8] or 0,
                    "register": r[9] or 0,
                    "last_at": str(r[10]) if r[10] else None,
                }
                for r in cur.fetchall()
            ]
            return resp(200, {"ok": True, "days": days, "total": total, "today": today,
                              "by_kind": by_kind, "by_phone": by_phone})

        # 8.1 Состояние заглушки «Скоро запуск» — доступно всем без авторизации
        if action == "get_maintenance":
            cur.execute("SELECT maintenance_enabled FROM app_settings WHERE id = 1")
            row = cur.fetchone()
            return resp(200, {"ok": True, "maintenance": bool(row[0]) if row else False})

        # 8.2 Админ: включить/выключить заглушку для всех пользователей
        if action == "admin_set_maintenance":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            enabled = bool(body.get("enabled"))
            cur.execute(
                "INSERT INTO app_settings (id, maintenance_enabled, updated_at) VALUES (1, %s, NOW()) "
                "ON CONFLICT (id) DO UPDATE SET maintenance_enabled = %s, updated_at = NOW()",
                (enabled, enabled)
            )
            conn.commit()
            return resp(200, {"ok": True, "maintenance": enabled})

        # 9. Выход
        if action == "logout":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute("UPDATE user_sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
            return resp(200, {"ok": True})

        # 10. Админ: список заявок на тариф «Для родных»
        if action == "admin_list_family_requests":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute(
                "SELECT fr.id, fr.user_id, u.full_name, u.phone, fr.code_word, fr.status, fr.created_at "
                "FROM family_requests fr JOIN users u ON u.id = fr.user_id ORDER BY fr.created_at DESC LIMIT 200"
            )
            rows = cur.fetchall()
            items = [
                {
                    "id": r[0], "user_id": r[1], "full_name": r[2], "phone": r[3],
                    "code_word": r[4], "status": r[5], "created_at": str(r[6]) if r[6] else None,
                }
                for r in rows
            ]
            return resp(200, {"ok": True, "items": items})

        # 11. Админ: подтвердить/отклонить заявку на тариф «Для родных»
        if action == "admin_decide_family_request":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            request_id = body.get("request_id")
            decision = body.get("decision")
            plan_expires_at = (body.get("plan_expires_at") or "").strip() or None
            if decision not in ("approved", "rejected"):
                return resp(400, {"error": "Некорректное решение"})
            if decision == "approved" and not plan_expires_at:
                return resp(400, {"error": "Укажите дату, до которой действует тариф"})
            cur.execute("SELECT user_id FROM family_requests WHERE id = %s", (request_id,))
            fr = cur.fetchone()
            if not fr:
                return resp(404, {"error": "Заявка не найдена"})
            cur.execute("UPDATE family_requests SET status = %s, decided_at = NOW() WHERE id = %s", (decision, request_id))
            if decision == "approved":
                cur.execute("UPDATE users SET plan = 'family', plan_expires_at = %s WHERE id = %s", (plan_expires_at, fr[0]))
            conn.commit()
            return resp(200, {"ok": True})

        # 12. Админ: получить текущее кодовое слово и срок действия тарифа «Для родных»
        if action == "admin_get_family_code":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute("SELECT code_word, expires_at FROM family_code_settings WHERE id = 1")
            row = cur.fetchone()
            return resp(200, {
                "ok": True,
                "code_word": row[0] if row else None,
                "expires_at": str(row[1]) if row and row[1] else None,
            })

        # 13. Админ: назначить/сменить кодовое слово и дату окончания его действия
        if action == "admin_set_family_code":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            code_word = (body.get("code_word") or "").strip()
            expires_at = (body.get("expires_at") or "").strip() or None
            if not code_word:
                return resp(400, {"error": "Введите кодовое слово"})
            cur.execute(
                "INSERT INTO family_code_settings (id, code_word, expires_at, updated_at) VALUES (1, %s, %s, NOW()) "
                "ON CONFLICT (id) DO UPDATE SET code_word = %s, expires_at = %s, updated_at = NOW()",
                (code_word, expires_at, code_word, expires_at)
            )
            conn.commit()
            return resp(200, {"ok": True, "code_word": code_word, "expires_at": expires_at})

        # 14. Админ: назначить пароль пользователю вручную (по логину, телефону или id)
        if action == "admin_set_user_password":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            target_login = (body.get("login") or "").strip()
            target_user_id = body.get("user_id")
            password = body.get("password") or ""
            if len(password) < 6:
                return resp(400, {"error": "Пароль должен быть не короче 6 символов"})
            if target_user_id:
                cur.execute("SELECT id FROM users WHERE id = %s", (target_user_id,))
            elif target_login:
                cur.execute(
                    "SELECT id FROM users WHERE login = %s OR phone = %s",
                    (target_login, normalize_phone(target_login))
                )
            else:
                return resp(400, {"error": "Укажите логин пользователя"})
            u = cur.fetchone()
            if not u:
                return resp(404, {"error": "Пользователь не найден"})
            cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(password), u[0]))
            conn.commit()
            return resp(200, {"ok": True})

        # 15. Админ: выдать доступ по паролю (приложение / лендинг юриста) со сроком от-до
        if action == "admin_grant_access":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})

            target = (body.get("target") or "").strip()  # app | lawyer_landing
            if target not in ("app", "lawyer_landing"):
                return resp(400, {"error": "Выберите назначение доступа"})
            password = body.get("password") or ""
            if len(password) < 6:
                return resp(400, {"error": "Пароль должен быть не короче 6 символов"})
            starts_at = (body.get("starts_at") or "").strip() or None
            expires_at = (body.get("expires_at") or "").strip() or None

            target_login = (body.get("login") or "").strip()
            user_id = None
            login_val = None

            if target == "app":
                if not target_login:
                    return resp(400, {"error": "Укажите логин пользователя"})
                cur.execute(
                    "SELECT id, login FROM users WHERE login = %s OR phone = %s OR email = %s",
                    (target_login, normalize_phone(target_login), target_login.lower())
                )
                u = cur.fetchone()
                if not u:
                    return resp(404, {"error": "Пользователь не найден"})
                user_id = u[0]
                login_val = u[1] or target_login
                cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(password), user_id))
            else:
                # Лендинг юриста — общий пароль, отдельного пользователя нет
                login_val = target_login or "Лендинг юриста"

            cur.execute(
                "INSERT INTO access_passwords (target, login, user_id, password_hash, starts_at, expires_at) "
                "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (target, login_val, user_id, hash_password(password), starts_at, expires_at)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {"ok": True, "id": new_id})

        # 16. Админ: список выданных доступов
        if action == "admin_list_access":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            cur.execute(
                "SELECT id, target, login, starts_at, expires_at, created_at, "
                "CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'expired' "
                "WHEN starts_at IS NOT NULL AND starts_at > NOW() THEN 'pending' ELSE 'active' END AS status "
                "FROM access_passwords ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
            items = [{
                "id": r[0],
                "target": r[1],
                "login": r[2],
                "starts_at": str(r[3]) if r[3] else None,
                "expires_at": str(r[4]) if r[4] else None,
                "created_at": str(r[5]) if r[5] else None,
                "status": r[6],
            } for r in rows]
            return resp(200, {"ok": True, "items": items})

        # 17. Админ: отозвать доступ
        if action == "admin_revoke_access":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute(
                "SELECT s.user_id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
            )
            s = cur.fetchone()
            if not s or s[1] != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            access_id = body.get("id")
            if not access_id:
                return resp(400, {"error": "Не указан доступ"})
            cur.execute("DELETE FROM access_passwords WHERE id = %s", (access_id,))
            conn.commit()
            return resp(200, {"ok": True})

        return resp(400, {"error": "unknown action"})
    finally:
        cur.close()
        conn.close()