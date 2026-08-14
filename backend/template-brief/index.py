import json
import os
import base64
import uuid
import boto3
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
        "Content-Type": "application/json",
    }


def resp(status, body):
    return {
        "statusCode": status,
        "headers": cors_headers(),
        "body": json.dumps(body, ensure_ascii=False),
        "isBase64Encoded": False,
    }


def get_user_id(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT user_id FROM user_sessions WHERE token = %s "
        "AND (expires_at IS NULL OR expires_at > NOW())",
        (token,),
    )
    r = cur.fetchone()
    return r[0] if r else None


def upload_pdf(data_b64: str, user_id: int) -> str:
    raw = base64.b64decode(data_b64)
    if len(raw) > 10 * 1024 * 1024:
        raise ValueError("Файл больше 10 МБ")
    if not raw[:5].startswith(b"%PDF"):
        raise ValueError("Принимаем только PDF")
    key = f"template-briefs/{user_id}/{uuid.uuid4().hex}.pdf"
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=key, Body=raw, ContentType="application/pdf")
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event: dict, context) -> dict:
    """Анкета на разработку шаблона документа: статус места по акции, приём ответов и PDF-образца."""
    method = event.get("httpMethod", "GET").upper()
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": "", "isBase64Encoded": False}

    headers = event.get("headers") or {}
    token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or ""

    conn = get_conn()
    cur = conn.cursor()
    try:
        uid = get_user_id(cur, token)
        if not uid:
            return resp(401, {"error": "Требуется вход"})

        # Есть ли у пользователя место по акции и заполнена ли анкета
        if method == "GET":
            cur.execute(
                "SELECT id, slot_number, status FROM promo_template_slots WHERE user_id = %s",
                (uid,),
            )
            slot = cur.fetchone()
            cur.execute(
                "SELECT id, status FROM template_briefs WHERE user_id = %s ORDER BY id DESC LIMIT 1",
                (uid,),
            )
            brief = cur.fetchone()
            return resp(200, {
                "ok": True,
                "has_slot": bool(slot),
                "slot_number": slot[1] if slot else None,
                "brief_sent": bool(brief),
                "brief_status": brief[1] if brief else None,
            })

        body = json.loads(event.get("body") or "{}")

        cur.execute("SELECT id FROM promo_template_slots WHERE user_id = %s", (uid,))
        slot = cur.fetchone()
        if not slot:
            return resp(403, {"error": "Анкета доступна участникам акции"})

        cur.execute("SELECT id FROM template_briefs WHERE user_id = %s LIMIT 1", (uid,))
        if cur.fetchone():
            return resp(409, {"error": "Анкета уже отправлена"})

        file_url = None
        if body.get("file_base64"):
            try:
                file_url = upload_pdf(body["file_base64"], uid)
            except ValueError as e:
                return resp(400, {"error": str(e)})

        answers = body.get("answers") or {}
        if not file_url and not answers:
            return resp(400, {"error": "Заполните анкету или загрузите файл"})

        cur.execute(
            "INSERT INTO template_briefs (user_id, slot_id, sample_file_url, sample_notes, answers) "
            "VALUES (%s,%s,%s,%s,%s) RETURNING id",
            (uid, slot[0], file_url, (body.get("sample_notes") or "")[:2000],
             json.dumps(answers, ensure_ascii=False)),
        )
        brief_id = cur.fetchone()[0]
        cur.execute(
            "UPDATE promo_template_slots SET request_text = %s, status = 'brief_sent' WHERE id = %s",
            (json.dumps(answers, ensure_ascii=False)[:4000], slot[0]),
        )
        conn.commit()
        return resp(200, {"ok": True, "brief_id": brief_id})
    finally:
        cur.close()
        conn.close()
