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
    """Справочник клиентов пользователя — получение и сохранение."""
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
            "SELECT id, client_type, name, inn, ogrnip, address FROM clients WHERE user_id = %s ORDER BY updated_at DESC",
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        keys = ["id", "client_type", "name", "inn", "ogrnip", "address"]
        clients = [dict(zip(keys, row)) for row in rows]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"clients": clients})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        inn = body.get("inn", "")
        if inn:
            cur.execute("""
                INSERT INTO clients (user_id, client_type, name, inn, ogrnip, address, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (user_id, inn) DO UPDATE SET
                    client_type = EXCLUDED.client_type,
                    name = EXCLUDED.name,
                    ogrnip = EXCLUDED.ogrnip,
                    address = EXCLUDED.address,
                    updated_at = NOW()
                RETURNING id
            """, (user_id, body.get("client_type"), body.get("name"), inn, body.get("ogrnip"), body.get("address")))
        else:
            cur.execute("""
                INSERT INTO clients (user_id, client_type, name, inn, ogrnip, address, updated_at)
                VALUES (%s, %s, %s, NULL, %s, %s, NOW())
                RETURNING id
            """, (user_id, body.get("client_type"), body.get("name"), body.get("ogrnip"), body.get("address")))
        client_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True, "id": client_id})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "method not allowed"})}
