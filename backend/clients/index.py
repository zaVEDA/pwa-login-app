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
    """Справочник клиентов пользователя — получение (с поиском по телефону), сохранение и удаление."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Phone",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    headers = event.get("headers") or {}
    phone = headers.get("x-phone") or headers.get("X-Phone", "")
    if not phone:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "phone required"})}

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_or_create_user(cur, phone)
    conn.commit()

    method = event.get("httpMethod")

    if method == "GET":
        params = event.get("queryStringParameters") or {}
        search = (params.get("search") or "").strip()
        search_digits = "".join(ch for ch in search if ch.isdigit())
        if search_digits:
            cur.execute(
                """
                SELECT id, client_type, name, inn, ogrnip, address, phone
                FROM clients
                WHERE user_id = %s AND regexp_replace(coalesce(phone, ''), '\\D', '', 'g') LIKE %s
                ORDER BY updated_at DESC
                """,
                (user_id, f"%{search_digits}%")
            )
        else:
            cur.execute(
                "SELECT id, client_type, name, inn, ogrnip, address, phone FROM clients WHERE user_id = %s ORDER BY updated_at DESC",
                (user_id,)
            )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        keys = ["id", "client_type", "name", "inn", "ogrnip", "address", "phone"]
        clients = [dict(zip(keys, row)) for row in rows]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"clients": clients})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        inn = body.get("inn", "")
        client_phone = body.get("phone", "") or None
        if inn:
            cur.execute("""
                INSERT INTO clients (user_id, client_type, name, inn, ogrnip, address, phone, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (user_id, inn) DO UPDATE SET
                    client_type = EXCLUDED.client_type,
                    name = EXCLUDED.name,
                    ogrnip = EXCLUDED.ogrnip,
                    address = EXCLUDED.address,
                    phone = EXCLUDED.phone,
                    updated_at = NOW()
                RETURNING id
            """, (user_id, body.get("client_type"), body.get("name"), inn, body.get("ogrnip"), body.get("address"), client_phone))
        else:
            cur.execute("""
                INSERT INTO clients (user_id, client_type, name, inn, ogrnip, address, phone, updated_at)
                VALUES (%s, %s, %s, NULL, %s, %s, %s, NOW())
                RETURNING id
            """, (user_id, body.get("client_type"), body.get("name"), body.get("ogrnip"), body.get("address"), client_phone))
        client_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True, "id": client_id})}

    if method == "DELETE":
        params = event.get("queryStringParameters") or {}
        client_id = params.get("id")
        if not client_id:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "id required"})}
        cur.execute("DELETE FROM clients WHERE id = %s AND user_id = %s", (client_id, user_id))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "method not allowed"})}
