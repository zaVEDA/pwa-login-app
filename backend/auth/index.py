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


def user_public(row, keys) -> dict:
    d = dict(zip(keys, row))
    d.pop("password_hash", None)
    for k in ("consent_at", "created_at", "last_login_at"):
        if d.get(k):
            d[k] = str(d[k])
    return d


USER_COLS = "id, phone, full_name, email, email_verified, login, role, consent_pep, profile_completed, status"
USER_KEYS = ["id", "phone", "full_name", "email", "email_verified", "login", "role", "consent_pep", "profile_completed", "status"]


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
            purpose = body.get("purpose", "login")  # login | reset
            channel = body.get("channel", "sms")    # sms | email
            phone = normalize_phone(body.get("phone", ""))
            email = (body.get("email") or "").strip().lower()

            user_id = None
            if channel == "sms":
                if not phone:
                    return resp(400, {"error": "Введите номер телефона"})
                cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
                r = cur.fetchone()
                user_id = r[0] if r else None
                if purpose == "reset" and not user_id:
                    return resp(404, {"error": "Аккаунт с таким номером не найден"})
            else:
                if not email:
                    return resp(400, {"error": "Введите email"})
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                r = cur.fetchone()
                user_id = r[0] if r else None
                if purpose == "reset" and not user_id:
                    return resp(404, {"error": "Аккаунт с таким email не найден"})

            code = gen_code()
            expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            cur.execute(
                "INSERT INTO auth_codes (user_id, phone, email, code, purpose, channel, expires_at) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                (user_id, phone or None, email or None, code, purpose, channel, expires)
            )
            conn.commit()
            # ЗАГЛУШКА: реальная отправка SMS/email подключается позже
            print(f"[AUTH CODE] purpose={purpose} channel={channel} phone={phone} email={email} CODE={code}")
            return resp(200, {"ok": True, "sent": True, "channel": channel, "dev_code": code})

        # 2. Проверка кода — вход/регистрация по телефону, либо подтверждение reset
        if action == "verify_code":
            purpose = body.get("purpose", "login")
            channel = body.get("channel", "sms")
            phone = normalize_phone(body.get("phone", ""))
            email = (body.get("email") or "").strip().lower()
            code = (body.get("code") or "").strip()

            if channel == "sms":
                cur.execute(
                    "SELECT id, code FROM auth_codes WHERE phone = %s AND purpose = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                    (phone, purpose)
                )
            else:
                cur.execute(
                    "SELECT id, code FROM auth_codes WHERE email = %s AND purpose = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                    (email, purpose)
                )
            row = cur.fetchone()
            if not row or row[1] != code:
                return resp(400, {"error": "Неверный или просроченный код"})
            cur.execute("UPDATE auth_codes SET used = TRUE WHERE id = %s", (row[0],))

            # Находим или создаём пользователя
            if channel == "sms":
                cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
                ex = cur.fetchone()
                if ex:
                    uid = ex[0]
                    cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (uid,))
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
            return resp(200, {"ok": True, "user": user_public(urow, USER_KEYS)})

        # 6. Обновить профиль (ФИО, email, логин, пароль)
        if action == "update_profile":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute("SELECT user_id FROM user_sessions WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())", (token,))
            s = cur.fetchone()
            if not s:
                return resp(401, {"error": "Сессия истекла"})
            uid = s[0]

            full_name = body.get("full_name")
            email = (body.get("email") or "").strip().lower() or None
            login = (body.get("login") or "").strip() or None
            password = body.get("password")

            if login:
                cur.execute("SELECT id FROM users WHERE login = %s AND id <> %s", (login, uid))
                if cur.fetchone():
                    return resp(409, {"error": "Этот логин уже занят"})
            if email:
                cur.execute("SELECT id FROM users WHERE email = %s AND id <> %s", (email, uid))
                if cur.fetchone():
                    return resp(409, {"error": "Этот email уже используется"})

            sets = ["full_name = %s", "email = %s", "login = %s", "profile_completed = TRUE"]
            params = [full_name, email, login]
            if password:
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

        # 8. Выход
        if action == "logout":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
            cur.execute("UPDATE user_sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
            return resp(200, {"ok": True})

        return resp(400, {"error": "unknown action"})
    finally:
        cur.close()
        conn.close()