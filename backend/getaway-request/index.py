import json
import os
import re
import smtplib
from email.mime.text import MIMEText
from email.header import Header


TARGET_EMAIL = "89016625752@mail.ru"


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }


def resp(status, body):
    return {"statusCode": status, "headers": cors_headers(), "body": json.dumps(body, ensure_ascii=False)}


def validate_phone(phone: str) -> bool:
    digits = re.sub(r"\D", "", phone or "")
    return len(digits) == 11 and digits.startswith("7")


def validate_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email or ""))


def send_email(name: str, phone: str, guests: str, email: str):
    host = os.environ["SMTP_HOST"]
    port = int(os.environ["SMTP_PORT"])
    user = os.environ["SMTP_USER"]
    password = os.environ["SMTP_PASSWORD"]

    text = (
        f"Новая заявка на путешествие Getaway (Байкал и Аршан)\n\n"
        f"Имя: {name}\n"
        f"Телефон: {phone}\n"
        f"Email: {email}\n"
        f"Количество человек: {guests}\n"
    )

    msg = MIMEText(text, "plain", "utf-8")
    msg["Subject"] = Header("Новая заявка Getaway — Байкал и Аршан", "utf-8")
    msg["From"] = user
    msg["To"] = TARGET_EMAIL

    with smtplib.SMTP_SSL(host, port, timeout=10) as server:
        server.login(user, password)
        server.sendmail(user, [TARGET_EMAIL], msg.as_string())


def handler(event: dict, context) -> dict:
    """Приём заявок с формы записи на путешествие Getaway и отправка их на почту организатора."""
    method = event.get("httpMethod", "POST")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    if method != "POST":
        return resp(405, {"error": "Метод не поддерживается"})

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return resp(400, {"error": "Некорректный формат данных"})

    name = (body.get("name") or "").strip()[:100]
    phone = (body.get("phone") or "").strip()
    email = (body.get("email") or "").strip()[:150]
    guests = str(body.get("guests") or "").strip()[:10]

    if len(name) < 2:
        return resp(400, {"error": "Укажите имя"})
    if not validate_phone(phone):
        return resp(400, {"error": "Укажите корректный номер телефона"})
    if not validate_email(email):
        return resp(400, {"error": "Укажите корректный email"})
    if not guests or not guests.isdigit() or int(guests) < 1:
        return resp(400, {"error": "Укажите количество человек"})

    try:
        send_email(name, phone, guests, email)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return resp(500, {"error": "Не удалось отправить заявку, попробуйте позже"})

    return resp(200, {"ok": True})
