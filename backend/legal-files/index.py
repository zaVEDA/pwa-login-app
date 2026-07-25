import json
import os
import base64
import uuid
import hashlib
import urllib.parse
import boto3
import psycopg2


def verify_password(password: str, stored: str) -> bool:
    if not stored or "$" not in stored:
        return False
    salt, h = stored.split("$", 1)
    return hashlib.sha256((salt + password).encode()).hexdigest() == h


def check_landing_password(given_pw: str) -> bool:
    """Пароль лендинга юриста: статичный секрет ИЛИ активный назначенный пароль из БД (с учётом срока)."""
    if not given_pw:
        return False
    real_pw = os.environ.get("LEGAL_PAGE_PASSWORD", "")
    if real_pw and given_pw == real_pw:
        return True
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        return False
    conn = psycopg2.connect(dsn)
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT password_hash FROM access_passwords "
            "WHERE target = 'lawyer_landing' "
            "AND (starts_at IS NULL OR starts_at <= NOW()) "
            "AND (expires_at IS NULL OR expires_at > NOW())"
        )
        for (ph,) in cur.fetchall():
            if verify_password(given_pw, ph):
                return True
        return False
    finally:
        conn.close()


def s3_client():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

PREFIX = "legal/"


def resp(status, body):
    return {"statusCode": status, "headers": CORS, "body": json.dumps(body, ensure_ascii=False)}


def cdn_url(key: str) -> str:
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event: dict, context) -> dict:
    """Прикреплённые файлы для страницы юриста: загрузка в облако (S3), список, удаление. Каталог — сам S3, без БД."""
    method = event.get("httpMethod", "GET")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            body = {}
    action = body.get("action") or ("list" if method == "GET" else "")

    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    given_pw = headers.get("x-legal-auth") or body.get("password") or ""

    # Проверка пароля страницы
    if action == "check_password":
        ok = check_landing_password(given_pw)
        return resp(200 if ok else 401, {"ok": ok})

    # Все операции с файлами требуют верного пароля
    if not check_landing_password(given_pw):
        return resp(401, {"error": "Требуется пароль"})

    s3 = s3_client()

    if action == "list":
        result = s3.list_objects_v2(Bucket="files", Prefix=PREFIX)
        files = []
        for obj in result.get("Contents", []):
            key = obj["Key"]
            if key.endswith("/"):
                continue
            head = s3.head_object(Bucket="files", Key=key)
            meta = head.get("Metadata", {})
            name = meta.get("origname")
            if name:
                name = urllib.parse.unquote(name)
            else:
                name = key.split("/")[-1]
            comment = meta.get("comment", "")
            if comment:
                comment = urllib.parse.unquote(comment)
            files.append({
                "id": key,
                "name": name,
                "comment": comment,
                "url": cdn_url(key),
                "size": obj.get("Size", 0),
                "content_type": head.get("ContentType", ""),
                "created_at": obj.get("LastModified").isoformat() if obj.get("LastModified") else "",
            })
        files.sort(key=lambda f: f["created_at"], reverse=True)
        return resp(200, {"files": files})

    if action == "upload":
        name = (body.get("name") or "file").strip()
        content_type = body.get("content_type") or "application/octet-stream"
        comment = (body.get("comment") or "").strip()[:2000]
        data_b64 = body.get("data") or ""
        if not data_b64:
            return resp(400, {"error": "Файл пуст"})
        raw = base64.b64decode(data_b64)
        if len(raw) > 20 * 1024 * 1024:
            return resp(400, {"error": "Файл больше 20 МБ"})
        ext = ""
        if "." in name:
            ext = "." + name.rsplit(".", 1)[-1][:10]
        key = f"{PREFIX}{uuid.uuid4().hex}{ext}"
        s3.put_object(
            Bucket="files",
            Key=key,
            Body=raw,
            ContentType=content_type,
            Metadata={
                "origname": urllib.parse.quote(name),
                "comment": urllib.parse.quote(comment),
            },
        )
        return resp(200, {"file": {
            "id": key,
            "name": name,
            "comment": comment,
            "url": cdn_url(key),
            "size": len(raw),
            "content_type": content_type,
        }})

    if action == "set_comment":
        key = body.get("id") or ""
        comment = (body.get("comment") or "").strip()[:2000]
        if not key.startswith(PREFIX):
            return resp(400, {"error": "Неверный файл"})
        head = s3.head_object(Bucket="files", Key=key)
        meta = dict(head.get("Metadata", {}))
        meta["comment"] = urllib.parse.quote(comment)
        s3.copy_object(
            Bucket="files",
            Key=key,
            CopySource={"Bucket": "files", "Key": key},
            Metadata=meta,
            MetadataDirective="REPLACE",
            ContentType=head.get("ContentType", "application/octet-stream"),
        )
        return resp(200, {"ok": True, "comment": comment})

    if action == "delete":
        key = body.get("id") or ""
        if key.startswith(PREFIX):
            try:
                s3.delete_object(Bucket="files", Key=key)
            except Exception:
                pass
        return resp(200, {"ok": True})

    return resp(400, {"error": "Неизвестное действие"})