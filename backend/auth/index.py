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


def sms_text(purpose: str, code: str) -> str:
    if purpose == "register":
        return f"ZavDoc: kod podtverzhdeniya registracii {code}. Deystvuet 10 minut."
    if purpose == "reset":
        return f"ZavDoc: kod dlya vosstanovleniya dostupa {code}. Nikomu ne soobshchayte."
    return f"ZavDoc: kod dlya vhoda {code}. Nikomu ne soobshchayte."


def send_sms(phone: str, text: str) -> dict:
    import urllib.request
    import urllib.parse
    api_id = os.environ.get("SMSRU_API_ID", "")
    to = re.sub(r"\D", "", phone or "")
    params = urllib.parse.urlencode({
        "api_id": api_id,
        "to": to,
        "msg": text,
        "from": "ZavDoc",
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


def user_public(row, keys) -> dict:
    d = dict(zip(keys, row))
    d.pop("password_hash", None)
    for k in ("consent_at", "created_at", "last_login_at", "plan_expires_at"):
        if d.get(k):
            d[k] = str(d[k])
    return d


USER_COLS = "id, phone, full_name, email, email_verified, login, role, consent_pep, profile_completed, status, plan, plan_expires_at"
USER_KEYS = ["id", "phone", "full_name", "email", "email_verified", "login", "role", "consent_pep", "profile_completed", "status", "plan", "plan_expires_at"]


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

    conn = get_conn()
    cur = conn.cursor()
    try:
        # 1. Запрос кода (на телефон или email)
        if action == "request_code":
            purpose = body.get("purpose", "login")  # login | reset | register
            channel = body.get("channel", "sms")    # sms | email
            phone = normalize_phone(body.get("phone", ""))
            email = (body.get("email") or "").strip().lower()

            reg_email = None
            reg_password_hash = None

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
                    password = body.get("password") or ""
                    consent = bool(body.get("consent"))
                    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", reg_email):
                        return resp(400, {"error": "Введите корректный email"})
                    if not re.match(r"^[A-Za-z0-9!-/:-@\[-`{-~]{1,6}$", password):
                        return resp(400, {"error": "Пароль: латиница, цифры и знаки, до 6 символов"})
                    if not consent:
                        return resp(400, {"error": "Нужно согласие на обработку персональных данных"})
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

            code = gen_code()
            expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            cur.execute(
                "INSERT INTO auth_codes (user_id, phone, email, code, purpose, channel, expires_at, reg_email, reg_password_hash) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (user_id, phone or None, email or None, code, purpose, channel, expires, reg_email, reg_password_hash)
            )
            conn.commit()
            print(f"[AUTH CODE] purpose={purpose} channel={channel} phone={phone} email={email} CODE={code}")

            if channel == "sms":
                sms_res = send_sms(phone, sms_text(purpose, code))
                if sms_res.get("status") != "OK":
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
                    "SELECT id, code, reg_email, reg_password_hash FROM auth_codes WHERE phone = %s AND purpose = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                    (phone, purpose)
                )
            else:
                cur.execute(
                    "SELECT id, code, reg_email, reg_password_hash FROM auth_codes WHERE email = %s AND purpose = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
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
                        "INSERT INTO users (phone, email, login, password_hash, consent_pep, consent_at, last_login_at, created_at) "
                        "VALUES (%s, %s, %s, %s, TRUE, NOW(), NOW(), NOW()) RETURNING id",
                        (phone, reg_email, reg_email, reg_password_hash)
                    )
                    uid = cur.fetchone()[0]
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
            if "email" in body:
                sets.append("email = %s")
                params.append(email)
            if "login" in body:
                sets.append("login = %s")
                params.append(login)
            if password:
                if len(password) < 6:
                    return resp(400, {"error": "Пароль должен быть не короче 6 символов"})
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
            if len(password) < 6:
                return resp(400, {"error": "Пароль должен быть не короче 6 символов"})
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

        return resp(400, {"error": "unknown action"})
    finally:
        cur.close()
        conn.close()