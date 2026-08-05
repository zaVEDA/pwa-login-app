import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
    "Access-Control-Max-Age": "86400",
}


def resp(code, data):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(data, default=str)}


COLS = ("id, title, summary, body, video_url, category, icon, read_time, "
        "featured, published, sort_order")


def row_to_article(r):
    return {"id": r[0], "title": r[1], "summary": r[2], "body": r[3],
            "video_url": r[4], "category": r[5], "icon": r[6], "read_time": r[7],
            "featured": r[8], "published": r[9], "sort_order": r[10]}


def normalize_video(url: str) -> str:
    """Приводит ссылку VK Video / RuTube к встраиваемому виду."""
    u = (url or "").strip()
    if not u:
        return ""
    if "rutube.ru/video/" in u and "/embed/" not in u:
        vid = u.split("rutube.ru/video/")[1].strip("/").split("?")[0].split("/")[0]
        return f"https://rutube.ru/play/embed/{vid}/"
    if "vk.com/video" in u and "video_ext.php" not in u:
        tail = u.split("vk.com/video")[1].split("?")[0].strip("/")
        if "_" in tail:
            oid, vid = tail.split("_")[0], tail.split("_")[1]
            return f"https://vk.com/video_ext.php?oid={oid}&id={vid}&hd=2"
    return u


def check_admin(cur, token):
    cur.execute(
        "SELECT u.id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())",
        (token,),
    )
    sess = cur.fetchone()
    return bool(sess and sess[1] == "admin")


def handler(event: dict, context) -> dict:
    """База знаний: чтение статей с видео и текстом для всех, управление статьями только для Заведующей."""
    method = event.get("httpMethod", "GET")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    token = headers.get("x-auth-token") or ""

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            body = {}
    action = body.get("action") or ("list" if method == "GET" else "")

    conn = get_conn()
    cur = conn.cursor()
    try:
        if action == "list":
            cur.execute(
                f"SELECT {COLS} FROM knowledge_articles WHERE published = TRUE "
                f"ORDER BY featured DESC, sort_order DESC, id DESC"
            )
            return resp(200, {"articles": [row_to_article(r) for r in cur.fetchall()]})

        if not check_admin(cur, token):
            return resp(403, {"error": "Доступ только для Заведующей"})

        if action == "list_all":
            cur.execute(
                f"SELECT {COLS} FROM knowledge_articles "
                f"ORDER BY featured DESC, sort_order DESC, id DESC"
            )
            return resp(200, {"articles": [row_to_article(r) for r in cur.fetchall()]})

        if action in ("create", "update"):
            title = (body.get("title") or "").strip()
            if not title:
                return resp(400, {"error": "Введите заголовок статьи"})
            vals = (
                title,
                (body.get("summary") or "").strip(),
                (body.get("body") or "").strip(),
                normalize_video(body.get("video_url") or ""),
                (body.get("category") or "").strip(),
                (body.get("icon") or "BookOpen").strip(),
                (body.get("read_time") or "").strip(),
                bool(body.get("featured")),
                bool(body.get("published", True)),
                int(body.get("sort_order") or 0),
            )
            if action == "create":
                cur.execute(
                    f"INSERT INTO knowledge_articles (title, summary, body, video_url, category, "
                    f"icon, read_time, featured, published, sort_order) "
                    f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING {COLS}",
                    vals,
                )
            else:
                aid = body.get("id")
                if not aid:
                    return resp(400, {"error": "Не указана статья"})
                cur.execute(
                    f"UPDATE knowledge_articles SET title=%s, summary=%s, body=%s, video_url=%s, "
                    f"category=%s, icon=%s, read_time=%s, featured=%s, published=%s, sort_order=%s, "
                    f"updated_at=NOW() WHERE id=%s RETURNING {COLS}",
                    vals + (aid,),
                )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Статья не найдена"})
            conn.commit()
            return resp(200, {"article": row_to_article(row)})

        if action == "delete":
            cur.execute("DELETE FROM knowledge_articles WHERE id = %s", (body.get("id"),))
            conn.commit()
            return resp(200, {"ok": True})

        return resp(400, {"error": "Неизвестное действие"})
    finally:
        cur.close()
        conn.close()
