import os
import hashlib
import datetime
import psycopg2
from urllib.parse import parse_qs


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def calc_signature(*args) -> str:
    joined = ":".join(str(a) for a in args)
    return hashlib.md5(joined.encode()).hexdigest().upper()


HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "text/plain",
}


def handler(event: dict, context) -> dict:
    """Result URL webhook от Robokassa: подтверждает оплату тарифа и продлевает подписку пользователя."""
    method = event.get("httpMethod", "GET").upper()
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": "", "isBase64Encoded": False}

    password_2 = os.environ.get("ROBOKASSA_PASSWORD_2")
    if not password_2:
        return {"statusCode": 500, "headers": HEADERS, "body": "Configuration error", "isBase64Encoded": False}

    params = {}
    body = event.get("body", "")
    if method == "POST" and body:
        if event.get("isBase64Encoded", False):
            import base64
            body = base64.b64decode(body).decode("utf-8")
        parsed = parse_qs(body)
        params = {k: v[0] for k, v in parsed.items()}
    if not params:
        params = event.get("queryStringParameters") or {}

    out_sum = params.get("OutSum", "")
    inv_id = params.get("InvId", "")
    signature_value = params.get("SignatureValue", "").upper()

    if not out_sum or not inv_id or not signature_value:
        return {"statusCode": 400, "headers": HEADERS, "body": "Missing required parameters", "isBase64Encoded": False}

    expected = calc_signature(out_sum, inv_id, password_2)
    if signature_value != expected:
        return {"statusCode": 400, "headers": HEADERS, "body": "Invalid signature", "isBase64Encoded": False}

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE plan_orders SET status = 'paid', paid_at = NOW() WHERE robokassa_inv_id = %s AND status = 'pending' "
            "RETURNING id, user_id, plan, period",
            (int(inv_id),)
        )
        row = cur.fetchone()
        if not row:
            cur.execute("SELECT status FROM plan_orders WHERE robokassa_inv_id = %s", (int(inv_id),))
            existing = cur.fetchone()
            if existing and existing[0] == "paid":
                return {"statusCode": 200, "headers": HEADERS, "body": f"OK{inv_id}", "isBase64Encoded": False}
            return {"statusCode": 404, "headers": HEADERS, "body": "Order not found", "isBase64Encoded": False}

        _, uid, plan, period = row
        days = 30 if period == "month" else 183
        cur.execute(
            "UPDATE users SET plan = %s, plan_expires_at = GREATEST(COALESCE(plan_expires_at, NOW()), NOW()) + %s * INTERVAL '1 day' "
            "WHERE id = %s",
            (plan, days, uid)
        )
        conn.commit()
        return {"statusCode": 200, "headers": HEADERS, "body": f"OK{inv_id}", "isBase64Encoded": False}
    finally:
        cur.close()
        conn.close()
