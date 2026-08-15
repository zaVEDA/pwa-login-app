import json
import os
import re
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
        "Content-Type": "application/json",
    }


def resp(status, body):
    return {"statusCode": status, "headers": cors(), "body": json.dumps(body, ensure_ascii=False)}


def send_sms(phone: str, text: str) -> bool:
    import urllib.request
    import urllib.parse
    api_id = os.environ.get("SMSRU_API_ID", "")
    to = re.sub(r"\D", "", phone or "")
    if not api_id or not to:
        return False
    params = urllib.parse.urlencode({
        "api_id": api_id, "to": to, "msg": text, "from": "capydoc.ru", "json": 1,
    })
    try:
        with urllib.request.urlopen(f"https://sms.ru/sms/send?{params}", timeout=8) as r:
            data = json.loads(r.read().decode())
        print(f"[SMS.RU] to={to} status={data.get('status')}")
        return data.get("status") == "OK"
    except Exception as e:
        print(f"[SMS.RU ERROR] {e}")
        return False


def session_user(cur, token):
    if not token:
        return None
    cur.execute(
        "SELECT s.user_id, u.role, u.phone FROM user_sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND (s.expires_at IS NULL OR s.expires_at > NOW())", (token,)
    )
    return cur.fetchone()


def get_settings(cur, uid):
    cur.execute(
        "SELECT notify_sms, notify_email, notify_docs, notify_plan, notify_news "
        "FROM notification_settings WHERE user_id = %s", (uid,)
    )
    r = cur.fetchone()
    if not r:
        return {"sms": True, "email": True, "docs": True, "plan": True, "news": False}
    return {"sms": r[0], "email": r[1], "docs": r[2], "plan": r[3], "news": r[4]}


DATA_WARNING = (
    "Если тариф не продлить, сохраните все подписанные вами документы: "
    "через 7 дней после окончания оплаты все данные будут удалены с сервера безвозвратно."
)


def reminder_plan(days_left: int):
    """Какое напоминание положено при таком остатке дней. None — не напоминаем."""
    if days_left == 7:
        return ("d7", "До конца тарифа неделя",
                "Ваш тариф заканчивается через 7 дней. Продлите, чтобы сохранить доступ к документам и шаблонам.")
    if days_left == 5:
        return ("d5", "До конца тарифа 5 дней",
                "Ваш тариф заканчивается через 5 дней. Продлите оплату, чтобы ничего не потерять.")
    if days_left == 3:
        return ("d3", "До конца тарифа 3 дня",
                "Ваш тариф заканчивается через 3 дня. Самое время продлить.")
    if 0 < days_left < 3:
        word = "завтра" if days_left == 1 else f"через {days_left} дня"
        return (f"d{days_left}", f"Тариф заканчивается {word}",
                f"Ваш тариф заканчивается {word}. Продлите оплату, чтобы сохранить доступ.")
    if days_left == 0:
        return ("d0", "Сегодня последний день тарифа",
                "Сегодня заканчивается ваш тариф. Продлите оплату, чтобы доступ не прервался.")
    if -7 <= days_left < 0:
        left = 7 + days_left
        if left == 0:
            return ("after0", "Сегодня данные будут удалены",
                    "Срок хранения истёк. Сегодня все ваши документы удаляются с сервера. "
                    "Если не успели — скачайте прямо сейчас или продлите тариф.")
        day_word = "день" if left == 1 else ("дня" if left < 5 else "дней")
        return (f"after{-days_left}", f"Данные удалим через {left} {day_word}",
                f"Тариф не продлён. Скачайте подписанные документы: через {left} {day_word} "
                "они будут удалены с сервера безвозвратно.")
    return None


def check_plan_reminders(cur, uid):
    """Создаёт напоминание об окончании тарифа, если сегодня подходящий день."""
    cur.execute(
        "SELECT plan, plan_expires_at::date, (plan_expires_at::date - CURRENT_DATE) "
        "FROM users WHERE id = %s", (uid,)
    )
    r = cur.fetchone()
    if not r or not r[0] or not r[1]:
        return
    expires_on, days_left = r[1], r[2]
    plan_data = reminder_plan(days_left)
    if not plan_data:
        return
    stage, title, text = plan_data
    cur.execute(
        "SELECT 1 FROM plan_reminders WHERE user_id = %s AND stage = %s AND expires_on = %s",
        (uid, stage, expires_on)
    )
    if cur.fetchone():
        return
    cur.execute(
        "INSERT INTO notifications (user_id, title, body, kind) VALUES (%s,%s,%s,'plan')",
        (uid, title, f"{text}\n\n{DATA_WARNING}")
    )
    cur.execute(
        "INSERT INTO plan_reminders (user_id, stage, expires_on) VALUES (%s,%s,%s) ON CONFLICT DO NOTHING",
        (uid, stage, expires_on)
    )


def handler(event: dict, context) -> dict:
    """Уведомления: настройки пользователя, лента сообщений и рассылка от Заведующей."""
    method = event.get("httpMethod", "GET")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    headers = event.get("headers") or {}
    token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or ""
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])
    action = body.get("action") or (event.get("queryStringParameters") or {}).get("action") or "list"

    conn = get_conn()
    cur = conn.cursor()
    try:
        me = session_user(cur, token)
        if not me:
            return resp(401, {"error": "Требуется вход"})
        uid, role, my_phone = me[0], me[1], me[2]

        if method == "GET" or action == "list":
            if get_settings(cur, uid)["plan"]:
                check_plan_reminders(cur, uid)
                conn.commit()
            cur.execute(
                "SELECT id, title, body, kind, is_read, created_at FROM notifications "
                "WHERE user_id = %s ORDER BY created_at DESC LIMIT 50", (uid,)
            )
            items = [
                {"id": r[0], "title": r[1], "body": r[2], "kind": r[3],
                 "is_read": r[4], "created_at": r[5].isoformat()}
                for r in cur.fetchall()
            ]
            unread = sum(1 for i in items if not i["is_read"])
            return resp(200, {"items": items, "unread": unread, "settings": get_settings(cur, uid)})

        if action == "save_settings":
            s = body.get("settings") or {}
            cur.execute(
                "INSERT INTO notification_settings (user_id, notify_sms, notify_email, notify_docs, notify_plan, notify_news) "
                "VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT (user_id) DO UPDATE SET "
                "notify_sms = EXCLUDED.notify_sms, notify_email = EXCLUDED.notify_email, "
                "notify_docs = EXCLUDED.notify_docs, notify_plan = EXCLUDED.notify_plan, "
                "notify_news = EXCLUDED.notify_news, updated_at = NOW()",
                (uid, bool(s.get("sms", True)), bool(s.get("email", True)), bool(s.get("docs", True)),
                 bool(s.get("plan", True)), bool(s.get("news", False)))
            )
            conn.commit()
            return resp(200, {"ok": True, "settings": get_settings(cur, uid)})

        if action == "mark_read":
            nid = body.get("id")
            if nid:
                cur.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s AND user_id = %s", (nid, uid))
            else:
                cur.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s", (uid,))
            conn.commit()
            return resp(200, {"ok": True})

        if action == "admin_send":
            if role != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            title = (body.get("title") or "").strip()[:200]
            text = (body.get("body") or "").strip()[:2000]
            if len(title) < 3 or len(text) < 5:
                return resp(400, {"error": "Заполните заголовок и текст"})
            kind = (body.get("kind") or "news")[:20]
            with_sms = bool(body.get("with_sms"))
            target = body.get("target") or "all"
            target_ids = body.get("user_ids") or []

            if target == "selected" and target_ids:
                ids = [int(i) for i in target_ids]
                cur.execute(
                    "SELECT id, phone FROM users WHERE id = ANY(%s) AND is_test = FALSE", (ids,)
                )
            elif target == "plan":
                cur.execute(
                    "SELECT id, phone FROM users WHERE plan = %s AND is_test = FALSE", (body.get("plan") or "",)
                )
            else:
                cur.execute("SELECT id, phone FROM users WHERE is_test = FALSE AND role <> 'admin'")
            users = cur.fetchall()
            if not users:
                return resp(400, {"error": "Получатели не найдены"})

            sent, sms_sent = 0, 0
            for u_id, u_phone in users:
                st = get_settings(cur, u_id)
                if kind == "news" and not st["news"]:
                    continue
                if kind == "docs" and not st["docs"]:
                    continue
                if kind == "plan" and not st["plan"]:
                    continue
                cur.execute(
                    "INSERT INTO notifications (user_id, title, body, kind) VALUES (%s,%s,%s,%s)",
                    (u_id, title, text, kind)
                )
                sent += 1
                if with_sms and st["sms"] and u_phone:
                    if send_sms(u_phone, f"{title}. {text}"[:300]):
                        sms_sent += 1
            conn.commit()
            return resp(200, {"ok": True, "sent": sent, "sms_sent": sms_sent, "total": len(users)})

        if action == "run_plan_reminders":
            if role != "admin":
                return resp(403, {"error": "Доступ запрещён"})
            with_sms = bool(body.get("with_sms"))
            cur.execute(
                "SELECT id, phone, (plan_expires_at::date - CURRENT_DATE) FROM users "
                "WHERE plan IS NOT NULL AND plan_expires_at IS NOT NULL AND is_test = FALSE "
                "AND (plan_expires_at::date - CURRENT_DATE) BETWEEN -7 AND 7"
            )
            rows = cur.fetchall()
            created, sms_sent = 0, 0
            for u_id, u_phone, days_left in rows:
                st = get_settings(cur, u_id)
                if not st["plan"]:
                    continue
                cur.execute("SELECT COUNT(*) FROM notifications WHERE user_id = %s", (u_id,))
                before = cur.fetchone()[0]
                check_plan_reminders(cur, u_id)
                cur.execute("SELECT COUNT(*) FROM notifications WHERE user_id = %s", (u_id,))
                if cur.fetchone()[0] > before:
                    created += 1
                    pd = reminder_plan(days_left)
                    if with_sms and st["sms"] and u_phone and pd:
                        if send_sms(u_phone, f"{pd[1]}. {pd[2]}"[:300]):
                            sms_sent += 1
            conn.commit()
            return resp(200, {"ok": True, "created": created, "sms_sent": sms_sent, "checked": len(rows)})

        return resp(400, {"error": "Неизвестное действие"})
    finally:
        cur.close()
        conn.close()