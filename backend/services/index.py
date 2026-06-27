import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_or_create_user(cur, phone: str) -> int:
    cur.execute(
        "INSERT INTO users (phone) VALUES (%s) ON CONFLICT (phone) DO UPDATE SET last_login_at = NOW() RETURNING id",
        (phone,)
    )
    return cur.fetchone()[0]


def handler(event: dict, context) -> dict:
    """Справочник услуг/товаров пользователя — получение и сохранение."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Phone",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    phone = (event.get("headers") or {}).get("x-phone") or (event.get("headers") or {}).get("X-Phone", "")
    if not phone:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "phone required"})}

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_or_create_user(cur, phone)
    conn.commit()

    method = event.get("httpMethod")

    if method == "GET":
        cur.execute(
            "SELECT id, name, price, unit FROM services WHERE user_id = %s ORDER BY updated_at DESC",
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        keys = ["id", "name", "price", "unit"]
        services = [dict(zip(keys, row)) for row in rows]
        # price — Decimal, конвертируем в float
        for s in services:
            if s["price"] is not None:
                s["price"] = float(s["price"])
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"services": services})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "").strip()
        if not name:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "name required"})}
        price = body.get("price")
        unit = body.get("unit") or "шт"
        cur.execute("""
            INSERT INTO services (user_id, name, price, unit, updated_at)
            VALUES (%s, %s, %s, %s, NOW())
            ON CONFLICT (user_id, name) DO UPDATE SET
                price = EXCLUDED.price,
                unit = EXCLUDED.unit,
                updated_at = NOW()
            RETURNING id
        """, (user_id, name, price, unit))
        service_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True, "id": service_id})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "method not allowed"})}
