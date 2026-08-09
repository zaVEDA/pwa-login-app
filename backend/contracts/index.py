import json
import os
import datetime
import hashlib
import secrets
import base64
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
        "signer_name": row[10],
        "signer_phone": row[11],
        "signer_ip": row[12],
        "sign_id": row[13],
        "sign_hash": row[14],
        "sent_at": row[15].isoformat() if row[15] else None,
    }


COLS = ("id, template_key, title, contract_number, contract_date, client_name, field_values, body, status, "
        "signed_at, signer_name, signer_phone, signer_ip, sign_id, sign_hash, sent_at")


PLAN_DOC_LIMITS = {"start": 15, "medium": 150, "pro": 150, "family": 150}
PRESALE_START = datetime.date(2026, 9, 1)


def _add_months(d: datetime.date, months: int) -> datetime.date:
    month_index = d.month - 1 + months
    return datetime.date(d.year + month_index // 12, month_index % 12 + 1, 1)


def check_limit(cur, user_id: int) -> dict:
    """Считает, сколько документов пользователь создал за расчётный период тарифа.
    Учитываются счета, акты/накладные и договоры вместе."""
    cur.execute("SELECT plan FROM users WHERE id = %s", (user_id,))
    urow = cur.fetchone()
    plan = urow[0] if urow else None
    limit = PLAN_DOC_LIMITS.get(plan) if plan else None
    today = datetime.date.today()

    cur.execute(
        "SELECT period, paid_at FROM plan_orders WHERE user_id = %s AND status = 'paid' "
        "AND paid_at IS NOT NULL ORDER BY paid_at DESC LIMIT 1",
        (user_id,)
    )
    order = cur.fetchone()

    if order and order[0] == "half_year":
        if today < PRESALE_START:
            start, end = PRESALE_START, _add_months(PRESALE_START, 1)
        else:
            n = (today.year - PRESALE_START.year) * 12 + (today.month - PRESALE_START.month)
            start, end = _add_months(PRESALE_START, n), _add_months(PRESALE_START, n + 1)
    elif order and order[1]:
        paid = order[1].date() if hasattr(order[1], "date") else order[1]
        cycles = (today - paid).days // 30
        start = paid + datetime.timedelta(days=cycles * 30)
        end = start + datetime.timedelta(days=30)
    else:
        start = datetime.date(today.year, today.month, 1)
        end = _add_months(start, 1)

    used = 0
    for table in ("invoices", "documents", "contracts"):
        cur.execute(
            f"SELECT COUNT(*) FROM {table} WHERE user_id = %s AND status != 'deleted' "
            "AND created_at >= %s AND created_at < %s",
            (user_id, start, end)
        )
        used += cur.fetchone()[0]

    result = {
        "plan": plan, "limit": limit, "used": used, "unlimited": limit is None,
        "period_start": str(start), "period_end": str(end),
    }
    if limit is not None:
        result["remaining"] = max(0, limit - used)
        result["reached"] = used >= limit
    else:
        result["remaining"] = None
        result["reached"] = False
    return result


def ensure_fonts():
    """Регистрирует шрифты с кириллицей из пакета matplotlib."""
    import matplotlib
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    mpl_dir = os.path.join(os.path.dirname(matplotlib.__file__), "mpl-data", "fonts", "ttf")
    registered = pdfmetrics.getRegisteredFontNames()
    if "DejaVuSans" not in registered:
        pdfmetrics.registerFont(TTFont("DejaVuSans", os.path.join(mpl_dir, "DejaVuSans.ttf")))
    if "DejaVuSans-Bold" not in registered:
        pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", os.path.join(mpl_dir, "DejaVuSans-Bold.ttf")))


def draw_stamp(canvas, doc):
    """Рисует синюю круглую печать простой электронной подписи в правом нижнем углу."""
    info = getattr(doc, "_stamp_info", None)
    if not info:
        return

    from reportlab.lib.units import mm
    from reportlab.lib.colors import Color

    blue = Color(0.05, 0.25, 0.65)
    cx, cy, r = 152 * mm, 42 * mm, 26 * mm

    canvas.saveState()
    canvas.setStrokeColor(blue)
    canvas.setFillColor(blue)
    canvas.setLineWidth(1.6)
    canvas.circle(cx, cy, r, stroke=1, fill=0)
    canvas.setLineWidth(0.8)
    canvas.circle(cx, cy, r - 2.6 * mm, stroke=1, fill=0)

    def centered(text, y, size, bold=False):
        canvas.setFont("DejaVuSans-Bold" if bold else "DejaVuSans", size)
        canvas.drawCentredString(cx, y, text)

    centered("ДОКУМЕНТ ПОДПИСАН", cy + 15 * mm, 5.2, True)
    centered("ПРОСТОЙ ЭЛЕКТРОННОЙ", cy + 11.5 * mm, 5.2, True)
    centered("ПОДПИСЬЮ", cy + 8 * mm, 5.2, True)

    canvas.setLineWidth(0.6)
    canvas.line(cx - 18 * mm, cy + 6 * mm, cx + 18 * mm, cy + 6 * mm)

    name = (info.get("signer_name") or "")[:26]
    centered(name, cy + 2 * mm, 5.6, True)
    centered(info.get("signer_phone") or "", cy - 1.5 * mm, 5.2)
    centered(info.get("sign_id") or "", cy - 5.5 * mm, 4.6)
    centered("Отпечаток:", cy - 9.5 * mm, 4.4)
    centered((info.get("sign_hash") or "")[:32], cy - 13 * mm, 4.0)
    centered(info.get("signed_label") or "", cy - 17 * mm, 4.6)

    canvas.restoreState()


def build_pdf(c: dict, performer: str) -> bytes:
    """Формирует PDF договора. Если документ подписан — добавляет синюю печать и реквизиты ПЭП."""
    import io
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

    ensure_fonts()
    signed = c.get("status") == "signed"

    buf = io.BytesIO()
    bottom = 78 * mm if signed else 20 * mm
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=18 * mm, bottomMargin=bottom,
    )

    title_st = ParagraphStyle("t", fontName="DejaVuSans-Bold", fontSize=12, leading=16, alignment=TA_CENTER)
    meta_st = ParagraphStyle("m", fontName="DejaVuSans", fontSize=8, leading=11, alignment=TA_CENTER, textColor="#666666")
    body_st = ParagraphStyle("b", fontName="DejaVuSans", fontSize=9.5, leading=14, alignment=TA_JUSTIFY)
    small_st = ParagraphStyle("s", fontName="DejaVuSans", fontSize=7.5, leading=10, textColor="#1a4099")

    text = c.get("body") or ""
    parts = text.split("\n\n")
    heading = parts[0].strip() if parts else c.get("title", "")
    rest = parts[1:] if len(parts) > 1 else []

    flow = [Paragraph(esc(heading), title_st), Spacer(1, 3 * mm)]
    meta = f"№ {c.get('contract_number','')} от {fmt_date(c.get('contract_date'))}"
    if performer:
        meta += f" · {performer}"
    flow += [Paragraph(esc(meta), meta_st), Spacer(1, 5 * mm)]

    for p in rest:
        if p.strip():
            flow.append(Paragraph(esc(p).replace("\n", "<br/>"), body_st))
            flow.append(Spacer(1, 3 * mm))

    if signed:
        flow.append(Spacer(1, 6 * mm))
        lines = [
            "Документ подписан простой электронной подписью",
            f"Подписант: {c.get('signer_name') or '—'}",
            f"Телефон подписанта: {c.get('signer_phone') or '—'}",
            f"Дата и время подписания: {fmt_dt(c.get('signed_at'))}",
            f"Идентификатор подписи: {c.get('sign_id') or '—'}",
            f"IP-адрес: {c.get('signer_ip') or '—'}",
            f"Отпечаток документа (SHA-256): {c.get('sign_hash') or '—'}",
        ]
        for ln in lines:
            flow.append(Paragraph(esc(ln), small_st))

    stamp = None
    if signed:
        stamp = {
            "signer_name": c.get("signer_name"),
            "signer_phone": c.get("signer_phone"),
            "sign_id": c.get("sign_id"),
            "sign_hash": c.get("sign_hash"),
            "signed_label": fmt_dt(c.get("signed_at")),
        }
    doc._stamp_info = stamp
    doc.build(flow, onFirstPage=draw_stamp, onLaterPages=draw_stamp)
    return buf.getvalue()


def esc(s: str) -> str:
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def fmt_date(v) -> str:
    if not v:
        return ""
    try:
        y, m, d = str(v)[:10].split("-")
        return f"{d}.{m}.{y}"
    except Exception:
        return str(v)


def fmt_dt(v) -> str:
    if not v:
        return ""
    s = str(v).replace("T", " ")[:19]
    date_part = fmt_date(s[:10])
    return f"{date_part} {s[11:19]}".strip()


def handler(event: dict, context) -> dict:
    """Договоры пользователя, созданные по шаблонам: список, сохранение, редактирование, смена статуса."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Phone",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    params = event.get("queryStringParameters") or {}
    token = params.get("token")
    if not token and event.get("httpMethod") == "POST":
        try:
            token = json.loads(event.get("body") or "{}").get("token")
        except Exception:
            token = None

    if token:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT l.contract_id, l.file_key, l.expires_at, l.expires_at < NOW() AS expired "
            "FROM contract_links l WHERE l.token = %s",
            (token,)
        )
        link = cur.fetchone()
        if not link:
            cur.close()
            conn.close()
            return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not_found"})}
        if link[3]:
            cur.close()
            conn.close()
            return {"statusCode": 410, "headers": cors, "body": json.dumps({"error": "expired"})}

        cid = link[0]

        # Клиент подписывает документ сам по ссылке, полученной по SMS.
        # Это единственный способ перевести договор в статус «Подписан».
        if event.get("httpMethod") == "POST":
            body = json.loads(event.get("body") or "{}")
            if body.get("action") == "client_sign":
                cur.execute(
                    "SELECT status, body, client_name, contract_number, user_id FROM contracts WHERE id = %s",
                    (cid,)
                )
                found = cur.fetchone()
                if not found:
                    cur.close()
                    conn.close()
                    return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not_found"})}

                cur_status, doc_text, cname, cnum, _owner_id = found
                if cur_status == "signed":
                    cur.close()
                    conn.close()
                    return {"statusCode": 409, "headers": cors, "body": json.dumps({"error": "already_signed"})}

                signer_name = (body.get("signer_name") or cname or "").strip()
                signer_phone = (body.get("signer_phone") or "").strip()
                if not signer_name:
                    cur.close()
                    conn.close()
                    return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "signer_name required"})}

                ip = ((event.get("requestContext") or {}).get("identity") or {}).get("sourceIp") or ""
                now = datetime.datetime.now()
                raw = f"{cid}|{cnum}|{doc_text}|{signer_name}|{signer_phone}|{now.isoformat()}"
                sign_hash = hashlib.sha256(raw.encode()).hexdigest()
                sign_id = f"ПЭП-{now.strftime('%Y%m%d')}-{sign_hash[:8].upper()}"

                cur.execute(
                    "UPDATE contracts SET status = 'signed', signed_at = NOW(), signer_name = %s, signer_phone = %s, "
                    "signer_ip = %s, sign_id = %s, sign_hash = %s, updated_at = NOW() WHERE id = %s",
                    (signer_name, signer_phone, ip, sign_id, sign_hash, cid)
                )
                conn.commit()
                cur.close()
                conn.close()
                return {
                    "statusCode": 200,
                    "headers": cors,
                    "body": json.dumps({
                        "status": "signed", "signed_at": now.isoformat(),
                        "signer_name": signer_name, "sign_id": sign_id,
                    }, ensure_ascii=False),
                }

        cur.execute("UPDATE contract_links SET opened_count = opened_count + 1 WHERE token = %s", (token,))
        conn.commit()
        cur.execute(
            "SELECT title, contract_number, contract_date, client_name, status, signed_at, signer_name FROM contracts WHERE id = %s",
            (cid,)
        )
        c = cur.fetchone()
        cur.close()
        conn.close()

        file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{link[1]}"
        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({
                "title": c[0], "contract_number": c[1],
                "contract_date": str(c[2]) if c[2] else None,
                "client_name": c[3], "status": c[4],
                "signed_at": str(c[5]) if c[5] else None,
                "signer_name": c[6],
                "file_url": file_url,
                "expires_at": str(link[2]),
            }, ensure_ascii=False),
        }

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
        cid = int(body.get("id"))
        status = body.get("status", "draft")

        if status == "signed":
            # Статус «Подписан» ставится только клиентом самостоятельно по ссылке
            # (action == "client_sign" в блоке обработки token выше) — вручную выставить нельзя.
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "status_signed_is_client_only"})}
        elif status == "sent":
            # Статус «Отправлен» ставится только автоматически после фактической отправки
            # SMS со ссылкой на подпись (см. action == "share_link" ниже) — вручную выставить нельзя.
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "status_sent_is_automatic"})}
        elif status == "draft":
            cur.execute(
                "UPDATE contracts SET status = 'draft', sent_at = NULL, signed_at = NULL, signer_name = NULL, "
                "signer_phone = NULL, signer_ip = NULL, sign_id = NULL, sign_hash = NULL, updated_at = NOW() "
                "WHERE id = %s AND user_id = %s",
                (cid, user_id)
            )
            cur.execute("DELETE FROM contract_links WHERE contract_id = %s AND user_id = %s", (cid, user_id))
        else:
            cur.execute(
                "UPDATE contracts SET status = %s, updated_at = NOW() WHERE id = %s AND user_id = %s",
                (status, cid, user_id)
            )

        conn.commit()
        cur.execute(f"SELECT {COLS} FROM contracts WHERE id = %s", (cid,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"contract": row_to_dict(row)}, ensure_ascii=False)}

    if action in ("pdf", "share_link"):
        cid = int(body.get("id"))
        cur.execute(f"SELECT {COLS} FROM contracts WHERE id = %s AND user_id = %s", (cid, user_id))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
        cur.execute("SELECT full_name FROM users WHERE id = %s", (user_id,))
        urow = cur.fetchone()
        performer = (urow[0] if urow else "") or ""
        cur.close()
        conn.close()
        c = row_to_dict(row)
        pdf = build_pdf(c, performer)

        if action == "share_link":
            import boto3
            s3 = boto3.client(
                "s3",
                endpoint_url="https://bucket.poehali.dev",
                aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
                aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
            )
            token = secrets.token_urlsafe(24)[:32]
            key = f"contracts/{user_id}/{cid}-{token}.pdf"
            s3.put_object(Bucket="files", Key=key, Body=pdf, ContentType="application/pdf")

            conn2 = get_conn()
            cur2 = conn2.cursor()
            cur2.execute("DELETE FROM contract_links WHERE contract_id = %s AND user_id = %s", (cid, user_id))
            cur2.execute(
                "INSERT INTO contract_links (token, contract_id, user_id, file_key, expires_at) "
                "VALUES (%s, %s, %s, %s, NOW() + INTERVAL '1 hour')",
                (token, cid, user_id, key)
            )
            conn2.commit()
            cur2.close()
            conn2.close()

            # Статус «Отправлен» ставится только при фактической отправке по SMS —
            # это единственный канал, которым клиент реально получает ссылку на подпись.
            if body.get("channel") == "sms":
                conn3 = get_conn()
                cur3 = conn3.cursor()
                cur3.execute(
                    "UPDATE contracts SET status = 'sent', sent_at = NOW(), updated_at = NOW() "
                    "WHERE id = %s AND user_id = %s AND status = 'draft'",
                    (cid, user_id)
                )
                conn3.commit()
                cur3.close()
                conn3.close()

            base = (body.get("origin") or "").rstrip("/")
            url = f"{base}/doc/{token}" if base else f"/doc/{token}"
            expires_at = (datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat(timespec="seconds")
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"url": url, "expires_at": expires_at})}

        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({"pdf_base64": base64.b64encode(pdf).decode()}),
        }

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
        lim = check_limit(cur, user_id)
        if lim.get("reached"):
            cur.close()
            conn.close()
            return {
                "statusCode": 403,
                "headers": cors,
                "body": json.dumps({"error": "limit_reached", "limits": lim}, ensure_ascii=False),
            }
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