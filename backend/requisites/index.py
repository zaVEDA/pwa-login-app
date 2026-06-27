import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Сохранение и получение реквизитов пользователя по номеру телефона."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Phone",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    phone = event.get("headers", {}).get("x-phone") or event.get("headers", {}).get("X-Phone", "")
    if not phone:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "phone required"})}

    conn = get_conn()
    cur = conn.cursor()

    # Создаём пользователя если не существует
    cur.execute(
        "INSERT INTO users (phone) VALUES (%s) ON CONFLICT (phone) DO UPDATE SET last_login_at = NOW() RETURNING id",
        (phone,)
    )
    user_id = cur.fetchone()[0]
    conn.commit()

    method = event.get("httpMethod")

    if method == "GET":
        cur.execute("SELECT entity_type, full_name, inn, ogrnip, address, bik, bank_name, corr_account, checking_account FROM requisites WHERE user_id = %s", (user_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"requisites": None})}
        keys = ["entity_type", "full_name", "inn", "ogrnip", "address", "bik", "bank_name", "corr_account", "checking_account"]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"requisites": dict(zip(keys, row))})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        cur.execute("""
            INSERT INTO requisites (user_id, entity_type, full_name, inn, ogrnip, address, bik, bank_name, corr_account, checking_account, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                entity_type = EXCLUDED.entity_type,
                full_name = EXCLUDED.full_name,
                inn = EXCLUDED.inn,
                ogrnip = EXCLUDED.ogrnip,
                address = EXCLUDED.address,
                bik = EXCLUDED.bik,
                bank_name = EXCLUDED.bank_name,
                corr_account = EXCLUDED.corr_account,
                checking_account = EXCLUDED.checking_account,
                updated_at = NOW()
        """, (
            user_id,
            body.get("entity_type"),
            body.get("full_name"),
            body.get("inn"),
            body.get("ogrnip"),
            body.get("address"),
            body.get("bik"),
            body.get("bank_name"),
            body.get("corr_account"),
            body.get("checking_account"),
        ))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "method not allowed"})}
