import json
import os
import psycopg2
from datetime import datetime

IDENTITY_LOCK_DAYS = 30


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
        cur.execute("SELECT entity_type, full_name, inn, ogrnip, address, bik, bank_name, corr_account, checking_account, okpo, kpp, identity_changed_at, sign_phone, sign_email FROM requisites WHERE user_id = %s", (user_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"requisites": None})}
        keys = ["entity_type", "full_name", "inn", "ogrnip", "address", "bik", "bank_name", "corr_account", "checking_account", "okpo", "kpp", "identity_changed_at", "sign_phone", "sign_email"]
        data = dict(zip(keys, row))
        if data.get("identity_changed_at"):
            data["identity_changed_at"] = data["identity_changed_at"].isoformat()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"requisites": data})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")

        # Проверяем, не меняется ли ЛИЦО (кому принадлежит тариф) — определяем строго по ИНН.
        # Форма деятельности (самозанятый/ИП/физлицо) может меняться в рамках ОДНОГО ИНН —
        # это тот же человек, просто сменивший налоговый статус, поэтому не блокируем.
        # Телефон, email и прочие контакты тоже меняются свободно.
        cur.execute("SELECT entity_type, inn, ogrnip, identity_changed_at FROM requisites WHERE user_id = %s", (user_id,))
        existing = cur.fetchone()

        new_entity_type = body.get("entity_type")
        new_inn = (body.get("inn") or "").strip()
        new_ogrnip = (body.get("ogrnip") or "").strip()

        if existing:
            old_entity_type, old_inn, old_ogrnip, identity_changed_at = existing
            old_inn = (old_inn or "").strip()
            old_ogrnip = (old_ogrnip or "").strip()

            had_identity = bool(old_inn)
            identity_key_changed = had_identity and bool(new_inn) and new_inn != old_inn

            if identity_key_changed:
                if identity_changed_at:
                    days_left = IDENTITY_LOCK_DAYS - (datetime.now() - identity_changed_at).days
                    if days_left > 0:
                        cur.close()
                        conn.close()
                        return {
                            "statusCode": 423,
                            "headers": cors,
                            "body": json.dumps({
                                "error": "identity_locked",
                                "message": f"Изменить лицо, от имени которого подписываются документы, можно не чаще 1 раза в 30 дней. Следующая смена будет доступна через {days_left} дн.",
                                "days_left": days_left,
                            })
                        }

                if not body.get("confirm_identity_change"):
                    cur.close()
                    conn.close()
                    return {
                        "statusCode": 409,
                        "headers": cors,
                        "body": json.dumps({
                            "error": "identity_change_confirm_required",
                            "message": "Вы меняете данные на другое лицо/компанию (по ИНН). Изменить лицо, от которого подписываются документы, можно не чаще 1 раза в 30 дней. Подтверждаете изменение?",
                        })
                    }

        cur.execute("""
            INSERT INTO requisites (user_id, entity_type, full_name, inn, ogrnip, address, bik, bank_name, corr_account, checking_account, okpo, kpp, sign_phone, sign_email, updated_at, identity_changed_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), CASE WHEN %s THEN NOW() ELSE NULL END)
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
                okpo = EXCLUDED.okpo,
                kpp = EXCLUDED.kpp,
                sign_phone = EXCLUDED.sign_phone,
                sign_email = EXCLUDED.sign_email,
                updated_at = NOW(),
                identity_changed_at = CASE WHEN %s THEN NOW() ELSE requisites.identity_changed_at END
        """, (
            user_id,
            new_entity_type,
            body.get("full_name"),
            body.get("inn"),
            body.get("ogrnip"),
            body.get("address"),
            body.get("bik"),
            body.get("bank_name"),
            body.get("corr_account"),
            body.get("checking_account"),
            body.get("okpo"),
            body.get("kpp"),
            body.get("sign_phone"),
            body.get("sign_email"),
            bool(body.get("confirm_identity_change")),
            bool(body.get("confirm_identity_change")),
        ))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "method not allowed"})}