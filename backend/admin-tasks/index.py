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

STATUSES = {"open", "done", "postponed", "irrelevant"}


def resp(code, data):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(data, default=str)}


COLS = "id, created_at, assignee, status, status_date, comment, note"


def task_row(r):
    return {"id": r[0], "created_at": r[1], "assignee": r[2], "status": r[3],
            "status_date": r[4], "comment": r[5], "note": r[6]}


def handler(event: dict, context) -> dict:
    """Управление задачами Заведующей: список, добавление, смена статуса, удаление. Доступ только admin."""
    method = event.get("httpMethod", "GET")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    token = headers.get("x-auth-token") or ""

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT u.id, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id "
            "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())",
            (token,),
        )
        sess = cur.fetchone()
        if not sess or sess[1] != "admin":
            return resp(403, {"error": "Доступ только для Заведующей"})

        body = {}
        if event.get("body"):
            try:
                body = json.loads(event["body"])
            except Exception:
                body = {}
        action = body.get("action") or ("list" if method == "GET" else "")

        if action == "list":
            cur.execute(
                f"SELECT {COLS} FROM admin_tasks ORDER BY sort_order DESC, id DESC"
            )
            return resp(200, {"tasks": [task_row(r) for r in cur.fetchall()]})

        if action == "add":
            comment = (body.get("comment") or "").strip()
            assignee = body.get("assignee") if body.get("assignee") in ("Я", "Юра") else "Я"
            if not comment:
                return resp(400, {"error": "Введите описание задачи"})
            cur.execute(
                f"INSERT INTO admin_tasks (assignee, comment, status) VALUES (%s, %s, 'open') "
                f"RETURNING {COLS}",
                (assignee, comment),
            )
            row = cur.fetchone()
            conn.commit()
            return resp(200, {"task": task_row(row)})

        if action == "set_status":
            tid = body.get("id")
            status = body.get("status")
            if status not in STATUSES:
                return resp(400, {"error": "Некорректный статус"})
            date_expr = "NULL" if status == "open" else "CURRENT_DATE"
            cur.execute(
                f"UPDATE admin_tasks SET status = %s, status_date = {date_expr} WHERE id = %s "
                f"RETURNING {COLS}",
                (status, tid),
            )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Задача не найдена"})
            conn.commit()
            return resp(200, {"task": task_row(row)})

        if action == "set_note":
            tid = body.get("id")
            note = (body.get("note") or "").strip()
            cur.execute(
                f"UPDATE admin_tasks SET note = %s WHERE id = %s RETURNING {COLS}",
                (note, tid),
            )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Задача не найдена"})
            conn.commit()
            return resp(200, {"task": task_row(row)})

        if action == "delete":
            cur.execute("DELETE FROM admin_tasks WHERE id = %s", (body.get("id"),))
            conn.commit()
            return resp(200, {"ok": True})

        return resp(400, {"error": "Неизвестное действие"})
    finally:
        cur.close()
        conn.close()