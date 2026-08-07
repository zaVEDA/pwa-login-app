import json
import os
import datetime
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_or_create_user(cur, phone: str) -> int:
    cur.execute(
        "INSERT INTO users (phone) VALUES (%s) ON CONFLICT (phone) DO UPDATE SET last_login_at = NOW() RETURNING id",
        (phone,)
    )
    return cur.fetchone()[0]


def next_number(cur, user_id: int) -> str:
    year = datetime.date.today().year
    prefix = f"Д-{year}-"
    cur.execute(
        "SELECT contract_number FROM contracts WHERE user_id = %s AND contract_number LIKE %s",
        (user_id, prefix + "%")
    )
    max_seq = 0
    for (num,) in cur.fetchall():
        tail = (num or "").replace(prefix, "")
        if tail.isdigit():
            max_seq = max(max_seq, int(tail))
    return f"{prefix}{max_seq + 1:03d}"


def row_to_dict(row):
    return {
        "id": row[0],
        "template_key": row[1],
        "title": row[2],
        "contract_number": row[3],
        "contract_date": row[4].isoformat() if row[4] else None,
        "client_name": row[5],
        "values": row[6] or {},
        "body": row[7],
        "status": row[8],
        "signed_at": row[9].isoformat() if row[9] else None,
    }


COLS = "id, template_key, title, contract_number, contract_date, client_name, field_values, body, status, signed_at"


def handler(event: dict, context) -> dict:
    """Договоры пользователя, созданные по шаблонам: список, сохранение, редактирование, смена статуса."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
        cid = params.get("id")
        if cid:
            cur.execute(f"SELECT {COLS} FROM contracts WHERE id = %s AND user_id = %s", (int(cid), user_id))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"contract": row_to_dict(row)}, ensure_ascii=False)}

        cur.execute(
            f"SELECT {COLS} FROM contracts WHERE user_id = %s AND status <> 'deleted' ORDER BY created_at DESC",
            (user_id,)
        )
        items = [row_to_dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"contracts": items}, ensure_ascii=False)}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action", "save")

    if action == "set_status":
        cid = body.get("id")
        status = body.get("status", "draft")
        signed = "NOW()" if status == "signed" else "NULL"
        cur.execute(
            f"UPDATE contracts SET status = %s, signed_at = {signed}, updated_at = NOW() WHERE id = %s AND user_id = %s",
            (status, int(cid), user_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    cid = body.get("id")
    template_key = body.get("template_key") or ""
    title = body.get("title") or "Договор"
    client_name = body.get("client_name") or ""
    values = json.dumps(body.get("values") or {}, ensure_ascii=False)
    doc_body = body.get("body") or ""
    contract_date = body.get("contract_date") or datetime.date.today().isoformat()

    if cid:
        cur.execute("SELECT status FROM contracts WHERE id = %s AND user_id = %s", (int(cid), user_id))
        found = cur.fetchone()
        if not found:
            cur.close()
            conn.close()
            return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
        if found[0] == "signed":
            cur.close()
            conn.close()
            return {"statusCode": 409, "headers": cors, "body": json.dumps({"error": "signed"})}
        cur.execute(
            "UPDATE contracts SET title = %s, client_name = %s, field_values = %s::jsonb, body = %s, "
            "contract_date = %s, updated_at = NOW() WHERE id = %s AND user_id = %s",
            (title, client_name, values, doc_body, contract_date, int(cid), user_id)
        )
        conn.commit()
        cur.execute(f"SELECT {COLS} FROM contracts WHERE id = %s", (int(cid),))
        row = cur.fetchone()
    else:
        number = next_number(cur, user_id)
        cur.execute(
            "INSERT INTO contracts (user_id, template_key, title, contract_number, contract_date, client_name, field_values, body, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s, 'draft') RETURNING " + COLS,
            (user_id, template_key, title, number, contract_date, client_name, values, doc_body)
        )
        row = cur.fetchone()
        conn.commit()

    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": cors, "body": json.dumps({"contract": row_to_dict(row)}, ensure_ascii=False)}
