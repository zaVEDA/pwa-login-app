import json
import os
import hashlib
import random
import datetime
import psycopg2
from urllib.parse import urlencode


PLANS = {
    "start": {"name": "Опора", "month": 1444.00, "half_year": 6868.00, "presale_half_year": 5955.00},
    "medium": {"name": "Рост", "month": 3333.00, "half_year": 15555.00, "presale_half_year": 12333.00},
    "pro": {"name": "Творец", "month": 7777.00, "half_year": 38888.00, "presale_half_year": 33777.00},
}
PRESALE_UNTIL = datetime.date(2026, 7, 15)
ROBOKASSA_URL = "https://auth.robokassa.ru/Merchant/Index.aspx"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def calc_signature(*args) -> str:
    joined = ":".join(str(a) for a in args)
    return hashlib.md5(joined.encode()).hexdigest()


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
        "Content-Type": "application/json",
    }


def resp(status, body):
    return {"statusCode": status, "headers": cors_headers(), "body": json.dumps(body, ensure_ascii=False), "isBase64Encoded": False}


def get_amount(plan: str, period: str) -> float:
    cfg = PLANS[plan]
    if period == "month":
        return cfg["month"]
    if datetime.date.today() <= PRESALE_UNTIL:
        return cfg["presale_half_year"]
    return cfg["half_year"]


def handler(event: dict, context) -> dict:
    """Создание заказа на оплату тарифа (Опора/Рост/Творец) и генерация ссылки на оплату Robokassa."""
    method = event.get("httpMethod", "GET").upper()
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": "", "isBase64Encoded": False}
    if method != "POST":
        return resp(405, {"error": "method not allowed"})

    headers = event.get("headers") or {}
    token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or ""
    body = json.loads(event.get("body") or "{}")
    plan = (body.get("plan") or "").strip()
    period = (body.get("period") or "").strip()
    success_url = str(body.get("success_url") or "")
    fail_url = str(body.get("fail_url") or "")

    if plan not in PLANS:
        return resp(400, {"error": "Неизвестный тариф"})
    if period not in ("month", "half_year"):
        return resp(400, {"error": "Неизвестный период оплаты"})
    if not token:
        return resp(401, {"error": "Требуется вход"})

    merchant_login = os.environ.get("ROBOKASSA_MERCHANT_LOGIN")
    password_1 = os.environ.get("ROBOKASSA_PASSWORD_1")
    if not merchant_login or not password_1:
        return resp(500, {"error": "Оплата временно недоступна"})

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT user_id FROM user_sessions WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())", (token,))
        s = cur.fetchone()
        if not s:
            return resp(401, {"error": "Сессия истекла"})
        uid = s[0]

        cur.execute("SELECT email, phone FROM users WHERE id = %s", (uid,))
        urow = cur.fetchone()
        user_email = (urow[0] if urow else None) or "noemail@zavedushaya.ru"

        amount = get_amount(plan, period)
        amount_str = f"{amount:.2f}"

        inv_id = None
        for _ in range(10):
            candidate = random.randint(100000, 2147483647)
            cur.execute("SELECT 1 FROM plan_orders WHERE robokassa_inv_id = %s", (candidate,))
            if not cur.fetchone():
                inv_id = candidate
                break
        if inv_id is None:
            return resp(500, {"error": "Не удалось создать заказ"})

        cur.execute(
            "INSERT INTO plan_orders (user_id, plan, period, amount, robokassa_inv_id, status) VALUES (%s,%s,%s,%s,%s,'pending') RETURNING id",
            (uid, plan, period, amount, inv_id)
        )
        order_id = cur.fetchone()[0]

        if success_url or fail_url:
            signature = calc_signature(merchant_login, amount_str, inv_id, success_url, "GET", fail_url, "GET", password_1)
        else:
            signature = calc_signature(merchant_login, amount_str, inv_id, password_1)

        plan_name = PLANS[plan]["name"]
        period_label = "1 месяц" if period == "month" else "6 месяцев"
        query_params = {
            "MerchantLogin": merchant_login,
            "OutSum": amount_str,
            "InvoiceID": inv_id,
            "SignatureValue": signature,
            "Email": user_email,
            "Culture": "ru",
            "Description": f"Тариф «{plan_name}» ({period_label})",
        }
        if success_url:
            query_params["SuccessUrl2"] = success_url
            query_params["SuccessUrl2Method"] = "GET"
        if fail_url:
            query_params["FailUrl2"] = fail_url
            query_params["FailUrl2Method"] = "GET"

        payment_url = f"{ROBOKASSA_URL}?{urlencode(query_params)}"
        conn.commit()
        return resp(200, {"ok": True, "payment_url": payment_url, "order_id": order_id, "amount": amount_str})
    finally:
        cur.close()
        conn.close()
