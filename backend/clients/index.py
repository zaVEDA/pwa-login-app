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


CLIENTS_WITH_STATS_SQL = """
    SELECT
        c.id, c.client_type, c.name, c.inn, c.ogrnip, c.address, c.phone, c.email,
        COALESCE(inv.cnt, 0) + COALESCE(doc.cnt, 0) + COALESCE(con.cnt, 0) AS documents_count,
        COALESCE(inv.paid, 0) AS payments_total
    FROM clients c
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt, COALESCE(SUM(total) FILTER (WHERE status = 'paid'), 0) AS paid
        FROM invoices i
        WHERE i.user_id = c.user_id AND i.status <> 'deleted'
          AND (
                (c.inn IS NOT NULL AND c.inn <> '' AND i.client_inn = c.inn)
                OR ((c.inn IS NULL OR c.inn = '') AND i.client_name = c.name)
              )
    ) inv ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM documents d
        WHERE d.user_id = c.user_id AND d.status <> 'deleted'
          AND (
                (c.inn IS NOT NULL AND c.inn <> '' AND d.client_inn = c.inn)
                OR ((c.inn IS NULL OR c.inn = '') AND d.client_name = c.name)
              )
    ) doc ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM contracts co
        WHERE co.user_id = c.user_id AND co.status <> 'deleted' AND co.client_name = c.name
    ) con ON true
    WHERE c.user_id = %s
"""


def handler(event: dict, context) -> dict:
    """Справочник клиентов пользователя: список (с поиском по телефону и статистикой
    по документам/оплатам), сохранение и удаление."""
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
        sql = CLIENTS_WITH_STATS_SQL
        query_params = [user_id]
        if search_digits:
            sql += " AND regexp_replace(coalesce(c.phone, ''), '\\D', '', 'g') LIKE %s"
            query_params.append(f"%{search_digits}%")
        sql += " ORDER BY c.updated_at DESC"
        cur.execute(sql, tuple(query_params))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        keys = ["id", "client_type", "name", "inn", "ogrnip", "address", "phone", "email", "documents_count", "payments_total"]
        clients = []
        for row in rows:
            d = dict(zip(keys, row))
            d["payments_total"] = float(d["payments_total"] or 0)
            clients.append(d)
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"clients": clients})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        inn = body.get("inn", "")
        client_phone = body.get("phone", "") or None
        client_email = body.get("email", "") or None
        if inn:
            cur.execute("""
                INSERT INTO clients (user_id, client_type, name, inn, ogrnip, address, phone, email, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (user_id, inn) DO UPDATE SET
                    client_type = EXCLUDED.client_type,
                    name = EXCLUDED.name,
                    ogrnip = EXCLUDED.ogrnip,
                    address = EXCLUDED.address,
                    phone = COALESCE(EXCLUDED.phone, clients.phone),
                    email = COALESCE(EXCLUDED.email, clients.email),
                    updated_at = NOW()
                RETURNING id
            """, (user_id, body.get("client_type"), body.get("name"), inn, body.get("ogrnip"), body.get("address"), client_phone, client_email))
        else:
            cur.execute("""
                INSERT INTO clients (user_id, client_type, name, inn, ogrnip, address, phone, email, updated_at)
                VALUES (%s, %s, %s, NULL, %s, %s, %s, %s, NOW())
                RETURNING id
            """, (user_id, body.get("client_type"), body.get("name"), body.get("ogrnip"), body.get("address"), client_phone, client_email))
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
