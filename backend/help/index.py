import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Справочные подсказки (раздел «Справка»), доступны всем пользователям."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    if event.get("httpMethod") != "GET":
        return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "method not allowed"})}

    qs = event.get("queryStringParameters") or {}
    category = qs.get("category")

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    try:
        if category:
            cur.execute(
                "SELECT tip_key, title, body, category FROM help_tips WHERE category = %s ORDER BY sort_order, id",
                (category,)
            )
        else:
            cur.execute("SELECT tip_key, title, body, category FROM help_tips ORDER BY sort_order, id")
        rows = cur.fetchall()
        tips = [
            {"key": r[0], "title": r[1], "body": r[2], "category": r[3]}
            for r in rows
        ]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"tips": tips}, ensure_ascii=False)}
    finally:
        cur.close()
        conn.close()
