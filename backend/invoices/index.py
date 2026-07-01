import json
import os
import psycopg2
import io
import base64
import datetime
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

_FONTS_READY = False
# Шрифт DejaVuSans берётся из пакета matplotlib (встроен, без скачивания)

def ensure_fonts():
    """Регистрирует шрифты с кириллицей. Берём TTF из пакета matplotlib —
    он поставляется вместе с DejaVuSans и не требует скачивания из сети.
    Шрифт встраивается прямо в PDF, поэтому корректно отображается
    на любых устройствах РФ (телефоны, ПК) без установки шрифтов."""
    global _FONTS_READY
    if _FONTS_READY:
        return
    import matplotlib
    mpl_dir = os.path.join(os.path.dirname(matplotlib.__file__), "mpl-data", "fonts", "ttf")
    regular = os.path.join(mpl_dir, "DejaVuSans.ttf")
    bold = os.path.join(mpl_dir, "DejaVuSans-Bold.ttf")
    registered = pdfmetrics.getRegisteredFontNames()
    if "DejaVuSans" not in registered:
        pdfmetrics.registerFont(TTFont("DejaVuSans", regular))
    if "DejaVuSans-Bold" not in registered:
        pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", bold if os.path.exists(bold) else regular))
    _FONTS_READY = True


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_or_create_user(cur, phone: str) -> int:
    cur.execute(
        "INSERT INTO users (phone) VALUES (%s) ON CONFLICT (phone) DO UPDATE SET last_login_at = NOW() RETURNING id",
        (phone,)
    )
    return cur.fetchone()[0]


def next_invoice_number(cur, user_id: int) -> str:
    year = datetime.date.today().year
    prefix = f"{year}-"
    cur.execute(
        "SELECT invoice_number FROM invoices WHERE user_id = %s AND invoice_number LIKE %s",
        (user_id, prefix + "%")
    )
    max_seq = 0
    for (num,) in cur.fetchall():
        try:
            seq = int(str(num).split("-")[-1])
            if seq > max_seq:
                max_seq = seq
        except (ValueError, AttributeError):
            pass
    return f"{year}-{max_seq + 1:04d}"


def next_document_number(cur, user_id: int) -> str:
    """Общая сквозная нумерация для актов и накладных (документы реализации)."""
    year = datetime.date.today().year
    prefix = f"{year}-"
    cur.execute(
        "SELECT doc_number FROM documents WHERE user_id = %s AND doc_number LIKE %s",
        (user_id, prefix + "%")
    )
    max_seq = 0
    for (num,) in cur.fetchall():
        try:
            seq = int(str(num).split("-")[-1])
            if seq > max_seq:
                max_seq = seq
        except (ValueError, AttributeError):
            pass
    return f"{year}-{max_seq + 1:04d}"


def fmt_date(value) -> str:
    if not value:
        return ""
    s = str(value).strip()
    try:
        return datetime.datetime.strptime(s[:10], "%Y-%m-%d").strftime("%d.%m.%Y")
    except ValueError:
        return s


def make_qr(data: str) -> io.BytesIO:
    qr = qrcode.QRCode(version=1, box_size=4, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def build_pdf(invoice: dict, seller: dict) -> bytes:
    ensure_fonts()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=20*mm, rightMargin=20*mm,
                            topMargin=15*mm, bottomMargin=15*mm)

    # Стили
    styles = getSampleStyleSheet()
    normal = ParagraphStyle("N", fontName="DejaVuSans", fontSize=9, leading=12)
    bold = ParagraphStyle("B", fontName="DejaVuSans-Bold", fontSize=9, leading=12)
    title_style = ParagraphStyle("T", fontName="DejaVuSans-Bold", fontSize=14, leading=18, alignment=TA_CENTER)
    small = ParagraphStyle("S", fontName="DejaVuSans", fontSize=8, leading=10, textColor=colors.grey)
    right = ParagraphStyle("R", fontName="DejaVuSans", fontSize=9, leading=12, alignment=TA_RIGHT)

    items = invoice.get("items", [])
    total = invoice.get("total", 0)
    inv_num = invoice.get("invoice_number", "—")
    inv_date = invoice.get("invoice_date", str(datetime.date.today()))
    due_date = invoice.get("due_date", "")
    comment = invoice.get("comment", "")

    client_name = invoice.get("client_name", "")
    client_inn = invoice.get("client_inn", "")
    client_ogrnip = invoice.get("client_ogrnip", "")
    client_address = invoice.get("client_address", "")

    seller_name = seller.get("full_name", "")
    seller_inn = seller.get("inn", "")
    seller_ogrnip = seller.get("ogrnip", "")
    seller_address = seller.get("address", "")
    bank_name = seller.get("bank_name", "")
    bik = seller.get("bik", "")
    checking = seller.get("checking_account", "")
    corr = seller.get("corr_account", "")

    story = []

    # ── Рамка с платёжными реквизитами получателя (как в банковских счетах) ──
    is_ip = seller.get("entity_type") == "ip"
    recipient = (f"ИП {seller_name}" if is_ip else seller_name) or "—"
    if seller_inn and (seller.get("kpp")):
        recipient_line = f"{recipient}\nИНН {seller_inn} КПП {seller.get('kpp')}"
    elif seller_inn:
        recipient_line = f"{recipient}\nИНН {seller_inn}"
    else:
        recipient_line = recipient

    bank_block = [
        [Paragraph(bank_name or "—", normal), Paragraph("<b>БИК</b>", bold), Paragraph(bik or "—", normal)],
        [Paragraph("Банк получателя", small), Paragraph("<b>Сч. №</b>", bold), Paragraph(corr or "—", normal)],
        [Paragraph(f"<b>ИНН</b> {seller_inn or '—'}", normal), Paragraph("<b>Сч. №</b>", bold), Paragraph(checking or "—", normal)],
        [Paragraph(recipient_line.replace("\n", "<br/>"), normal), Paragraph("", normal), Paragraph("", normal)],
        [Paragraph("Получатель", small), Paragraph("", normal), Paragraph("", normal)],
    ]
    bank_table = Table(bank_block, colWidths=[95*mm, 20*mm, 55*mm])
    bank_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.75, colors.HexColor("#333333")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        # Объединяем ячейки БИК/Сч.№ по вертикали для банка и получателя
        ("SPAN", (0, 3), (2, 3)),   # строка с получателем (ФИО+ИНН) на всю ширину
        ("SPAN", (0, 4), (2, 4)),   # подпись «Получатель»
        ("LINEBELOW", (0, 2), (-1, 2), 0.75, colors.HexColor("#333333")),
    ]))
    story.append(bank_table)
    story.append(Spacer(1, 6*mm))

    # Заголовок
    story.append(Paragraph(f"СЧЁТ НА ОПЛАТУ № {inv_num}", title_style))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(f"от {fmt_date(inv_date)}", ParagraphStyle("DC", fontName="DejaVuSans", fontSize=10, alignment=TA_CENTER, textColor=colors.grey)))
    story.append(Spacer(1, 5*mm))

    # Продавец / Покупатель
    party_data = [
        [Paragraph("<b>Продавец:</b>", bold), Paragraph(f"ИП {seller_name}" if seller.get("entity_type") == "ip" else seller_name, normal)],
        [Paragraph("ИНН:", small), Paragraph(seller_inn, normal)],
    ]
    if seller_ogrnip:
        party_data.append([Paragraph("ОГРНИП:", small), Paragraph(seller_ogrnip, normal)])
    if seller_address:
        party_data.append([Paragraph("Адрес:", small), Paragraph(seller_address, normal)])
    if bank_name:
        party_data.append([Paragraph("Банк:", small), Paragraph(bank_name, normal)])
    if bik:
        party_data.append([Paragraph("БИК:", small), Paragraph(bik, normal)])
    if checking:
        party_data.append([Paragraph("Р/с:", small), Paragraph(checking, normal)])
    if corr:
        party_data.append([Paragraph("К/с:", small), Paragraph(corr, normal)])

    party_data.append([Paragraph("", normal), Paragraph("", normal)])
    party_data.append([Paragraph("<b>Покупатель:</b>", bold), Paragraph(client_name, normal)])
    if client_inn:
        party_data.append([Paragraph("ИНН:", small), Paragraph(client_inn, normal)])
    if client_ogrnip:
        party_data.append([Paragraph("ОГРНИП:", small), Paragraph(client_ogrnip, normal)])
    if client_address:
        party_data.append([Paragraph("Адрес:", small), Paragraph(client_address, normal)])

    party_table = Table(party_data, colWidths=[30*mm, 130*mm])
    party_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
    ]))
    story.append(party_table)
    story.append(Spacer(1, 5*mm))

    # Таблица позиций
    col_headers = [
        Paragraph("<b>№</b>", bold),
        Paragraph("<b>Наименование</b>", bold),
        Paragraph("<b>Кол-во</b>", bold),
        Paragraph("<b>Цена, ₽</b>", bold),
        Paragraph("<b>Сумма, ₽</b>", bold),
    ]
    table_data = [col_headers]
    for idx, item in enumerate(items, 1):
        qty = float(item.get("qty", 1))
        price = float(item.get("price", 0))
        amount = qty * price
        table_data.append([
            Paragraph(str(idx), normal),
            Paragraph(item.get("name", ""), normal),
            Paragraph(f"{qty:g}", normal),
            Paragraph(f"{price:,.2f}", normal),
            Paragraph(f"{amount:,.2f}", normal),
        ])

    # Итого
    table_data.append(["", "", "", Paragraph("<b>Итого:</b>", bold), Paragraph(f"<b>{total:,.2f} ₽</b>", bold)])

    items_table = Table(table_data, colWidths=[10*mm, 90*mm, 20*mm, 25*mm, 25*mm])
    items_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F5F0E8")),
        ("GRID", (0, 0), (-1, -2), 0.5, colors.HexColor("#E0D8CC")),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#C8A96E")),
        ("FONTNAME", (0, 0), (-1, 0), "DejaVuSans-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 5*mm))

    # QR-код для оплаты (СБП / реквизиты)
    qr_data = f"ST00012|Name={seller_name}|PersonalAcc={checking}|BankName={bank_name}|BIC={bik}|CorrespAcc={corr}|Sum={int(total*100)}|Purpose=Счёт №{inv_num}"
    qr_buf = make_qr(qr_data)
    qr_img = Image(qr_buf, width=28*mm, height=28*mm)

    footer_data = [[
        qr_img,
        Paragraph(
            f"<b>Оплата по QR-коду</b><br/>Сканируйте приложением банка<br/><br/>"
            + (f"Срок оплаты: {fmt_date(due_date)}<br/>" if due_date else "")
            + (f"{comment}" if comment else ""),
            normal
        )
    ]]
    footer_table = Table(footer_data, colWidths=[35*mm, 135*mm])
    footer_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (1, 0), (1, 0), 5),
    ]))
    story.append(footer_table)

    doc.build(story)
    buf.seek(0)
    return buf.read()


def build_document(invoice: dict, seller: dict, doc_type: str) -> bytes:
    """Акт выполненных работ или Товарная накладная на основе данных счёта."""
    ensure_fonts()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=20*mm, rightMargin=20*mm,
                            topMargin=15*mm, bottomMargin=15*mm)

    normal = ParagraphStyle("N", fontName="DejaVuSans", fontSize=9, leading=12)
    bold = ParagraphStyle("B", fontName="DejaVuSans-Bold", fontSize=9, leading=12)
    title_style = ParagraphStyle("T", fontName="DejaVuSans-Bold", fontSize=14, leading=18, alignment=TA_CENTER)
    small = ParagraphStyle("S", fontName="DejaVuSans", fontSize=8, leading=10, textColor=colors.grey)

    items = invoice.get("items", [])
    total = invoice.get("total", 0)
    doc_num = invoice.get("doc_number") or invoice.get("invoice_number", "—")
    doc_date = invoice.get("doc_date") or invoice.get("invoice_date", str(datetime.date.today()))
    basis_num = invoice.get("invoice_number", "")
    basis_date = invoice.get("invoice_date", "")

    client_name = invoice.get("client_name", "")
    client_inn = invoice.get("client_inn", "")
    client_ogrnip = invoice.get("client_ogrnip", "")
    client_address = invoice.get("client_address", "")

    seller_name = seller.get("full_name", "")
    seller_inn = seller.get("inn", "")
    is_ip = seller.get("entity_type") == "ip"
    seller_display = f"ИП {seller_name}" if is_ip else seller_name

    is_act = doc_type == "act"
    if is_act:
        head = f"АКТ № {doc_num}"
        subhead = "выполненных работ (оказанных услуг)"
        col_name = "Наименование работы, услуги"
    else:
        head = f"ТОВАРНАЯ НАКЛАДНАЯ № {doc_num}"
        subhead = "на отпуск товаров"
        col_name = "Наименование товара"

    story = []
    story.append(Paragraph(head, title_style))
    story.append(Spacer(1, 1*mm))
    story.append(Paragraph(subhead, ParagraphStyle("SH", fontName="DejaVuSans", fontSize=10, alignment=TA_CENTER, textColor=colors.grey)))
    story.append(Spacer(1, 1*mm))
    story.append(Paragraph(f"от {fmt_date(doc_date)}", ParagraphStyle("DC", fontName="DejaVuSans", fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))
    story.append(Spacer(1, 5*mm))

    party_data = [
        [Paragraph("<b>Исполнитель:</b>" if is_act else "<b>Поставщик:</b>", bold), Paragraph(seller_display, normal)],
        [Paragraph("ИНН:", small), Paragraph(seller_inn or "—", normal)],
        [Paragraph("", normal), Paragraph("", normal)],
        [Paragraph("<b>Заказчик:</b>" if is_act else "<b>Покупатель:</b>", bold), Paragraph(client_name or "—", normal)],
    ]
    if client_inn:
        party_data.append([Paragraph("ИНН:", small), Paragraph(client_inn, normal)])
    if client_ogrnip:
        party_data.append([Paragraph("ОГРНИП:", small), Paragraph(client_ogrnip, normal)])
    if client_address:
        party_data.append([Paragraph("Адрес:", small), Paragraph(client_address, normal)])
    if basis_num:
        party_data.append([Paragraph("Основание:", small), Paragraph(f"Счёт № {basis_num} от {fmt_date(basis_date)}", normal)])

    party_table = Table(party_data, colWidths=[30*mm, 130*mm])
    party_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
    ]))
    story.append(party_table)
    story.append(Spacer(1, 5*mm))

    col_headers = [
        Paragraph("<b>№</b>", bold),
        Paragraph(f"<b>{col_name}</b>", bold),
        Paragraph("<b>Кол-во</b>", bold),
        Paragraph("<b>Цена, ₽</b>", bold),
        Paragraph("<b>Сумма, ₽</b>", bold),
    ]
    table_data = [col_headers]
    for idx, item in enumerate(items, 1):
        qty = float(item.get("qty", 1))
        price = float(item.get("price", 0))
        amount = qty * price
        table_data.append([
            Paragraph(str(idx), normal),
            Paragraph(item.get("name", ""), normal),
            Paragraph(f"{qty:g}", normal),
            Paragraph(f"{price:,.2f}", normal),
            Paragraph(f"{amount:,.2f}", normal),
        ])
    table_data.append(["", "", "", Paragraph("<b>Итого:</b>", bold), Paragraph(f"<b>{total:,.2f} ₽</b>", bold)])

    items_table = Table(table_data, colWidths=[10*mm, 90*mm, 20*mm, 25*mm, 25*mm])
    items_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F5F0E8")),
        ("GRID", (0, 0), (-1, -2), 0.5, colors.HexColor("#E0D8CC")),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#C8A96E")),
        ("FONTNAME", (0, 0), (-1, 0), "DejaVuSans-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 4*mm))

    count = len(items)
    story.append(Paragraph(
        f"Всего наименований {count}, на сумму {total:,.2f} ₽",
        bold
    ))
    story.append(Spacer(1, 2*mm))
    if is_act:
        story.append(Paragraph(
            "Вышеперечисленные работы (услуги) выполнены полностью и в срок. "
            "Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.",
            normal
        ))
    story.append(Spacer(1, 12*mm))

    sign_left = "Исполнитель" if is_act else "Поставщик"
    sign_right = "Заказчик" if is_act else "Покупатель"
    sign_data = [
        [Paragraph(f"<b>{sign_left}</b>", bold), Paragraph(f"<b>{sign_right}</b>", bold)],
        [Paragraph(seller_display, normal), Paragraph(client_name or "", normal)],
        [Paragraph("_______________ / подпись", small), Paragraph("_______________ / подпись", small)],
        [Paragraph("М.П.", small), Paragraph("М.П.", small)],
    ]
    sign_table = Table(sign_data, colWidths=[85*mm, 85*mm])
    sign_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(sign_table)

    doc.build(story)
    buf.seek(0)
    return buf.read()


def handler(event: dict, context) -> dict:
    """Счета пользователя: получение списка, сохранение, генерация PDF."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Phone",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    phone = (event.get("headers") or {}).get("x-phone") or (event.get("headers") or {}).get("X-Phone", "")
    if not phone:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "phone required"})}

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_or_create_user(cur, phone)
    conn.commit()

    method = event.get("httpMethod")
    qs = event.get("queryStringParameters") or {}

    # GET /invoices — список или следующий номер
    if method == "GET":
        if qs.get("next_number"):
            num = next_invoice_number(cur, user_id)
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"invoice_number": num})}

        # Список документов реализации (акты и накладные)
        if qs.get("documents"):
            cur.execute(
                "SELECT id, doc_type, doc_number, doc_date, invoice_number, client_name, total, status FROM documents WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            cur.close(); conn.close()
            keys = ["id", "doc_type", "doc_number", "doc_date", "invoice_number", "client_name", "total", "status"]
            docs = []
            for row in rows:
                d = dict(zip(keys, row))
                if d["doc_date"]: d["doc_date"] = str(d["doc_date"])
                if d["total"] is not None: d["total"] = float(d["total"])
                docs.append(d)
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"documents": docs}, ensure_ascii=False)}

        # Полные данные одного документа реализации
        if qs.get("document_id"):
            cur.execute(
                """SELECT id, doc_type, doc_number, doc_date, invoice_number, client_type, client_name,
                    client_inn, client_ogrnip, client_address, items, total, status
                   FROM documents WHERE id = %s AND user_id = %s""",
                (qs.get("document_id"), user_id)
            )
            row = cur.fetchone()
            cur.close(); conn.close()
            if not row:
                return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
            keys = ["id", "doc_type", "doc_number", "doc_date", "invoice_number", "client_type", "client_name",
                    "client_inn", "client_ogrnip", "client_address", "items", "total", "status"]
            d = dict(zip(keys, row))
            if d["doc_date"]: d["doc_date"] = str(d["doc_date"])
            if d["total"] is not None: d["total"] = float(d["total"])
            if isinstance(d["items"], str):
                try: d["items"] = json.loads(d["items"])
                except (ValueError, TypeError): d["items"] = []
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"document": d}, ensure_ascii=False)}

        # GET ?id= — полные данные одного счёта
        if qs.get("id"):
            cur.execute(
                """SELECT id, invoice_number, invoice_date, client_type, client_name, client_inn,
                    client_ogrnip, client_address, items, total, due_date, comment, status
                   FROM invoices WHERE id = %s AND user_id = %s""",
                (qs.get("id"), user_id)
            )
            row = cur.fetchone()
            cur.close(); conn.close()
            if not row:
                return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
            keys = ["id", "invoice_number", "invoice_date", "client_type", "client_name", "client_inn",
                    "client_ogrnip", "client_address", "items", "total", "due_date", "comment", "status"]
            inv = dict(zip(keys, row))
            if inv["invoice_date"]: inv["invoice_date"] = str(inv["invoice_date"])
            if inv["due_date"]: inv["due_date"] = str(inv["due_date"])
            if inv["total"] is not None: inv["total"] = float(inv["total"])
            if isinstance(inv["items"], str):
                try: inv["items"] = json.loads(inv["items"])
                except (ValueError, TypeError): inv["items"] = []
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"invoice": inv}, ensure_ascii=False)}

        cur.execute(
            "SELECT id, invoice_number, invoice_date, client_name, total, status FROM invoices WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close(); conn.close()
        keys = ["id", "invoice_number", "invoice_date", "client_name", "total", "status"]
        invoices = []
        for row in rows:
            d = dict(zip(keys, row))
            if d["invoice_date"]: d["invoice_date"] = str(d["invoice_date"])
            if d["total"]: d["total"] = float(d["total"])
            invoices.append(d)
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"invoices": invoices})}

    # POST — сохранить счёт и вернуть PDF
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        action = body.get("action", "save")

        # Смена статуса счёта: created | issued | paid | deleted
        if action == "set_status":
            new_status = body.get("status")
            inv_id = body.get("id")
            if new_status not in ("created", "issued", "paid", "deleted"):
                cur.close(); conn.close()
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "bad status"})}
            cur.execute(
                "UPDATE invoices SET status=%s, updated_at=NOW() WHERE id=%s AND user_id=%s RETURNING id",
                (new_status, inv_id, user_id)
            )
            ok = cur.fetchone() is not None
            conn.commit()
            cur.close(); conn.close()
            return {"statusCode": 200 if ok else 404, "headers": cors, "body": json.dumps({"ok": ok, "status": new_status})}

        # Обновление документа реализации (акт/накладная)
        if action == "update_document":
            d_id = body.get("id")
            items = body.get("items", [])
            total = sum(float(i.get("qty", 1)) * float(i.get("price", 0)) for i in items)
            cur.execute("""
                UPDATE documents SET doc_type=%s, doc_date=%s, client_type=%s, client_name=%s, client_inn=%s,
                    client_ogrnip=%s, client_address=%s, items=%s, total=%s, updated_at=NOW()
                WHERE id=%s AND user_id=%s RETURNING id, doc_number
            """, (
                body.get("doc_type", "act"),
                body.get("doc_date") or str(datetime.date.today()),
                body.get("client_type"), body.get("client_name", ""),
                body.get("client_inn", ""), body.get("client_ogrnip", ""), body.get("client_address", ""),
                json.dumps(items, ensure_ascii=False), total, d_id, user_id
            ))
            row = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            if not row:
                return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True, "id": row[0], "doc_number": row[1]})}

        # Смена статуса документа реализации (акт/накладная)
        if action == "set_document_status":
            new_status = body.get("status")
            d_id = body.get("id")
            if new_status not in ("created", "issued", "signed", "deleted"):
                cur.close(); conn.close()
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "bad status"})}
            cur.execute(
                "UPDATE documents SET status=%s, updated_at=NOW() WHERE id=%s AND user_id=%s RETURNING id",
                (new_status, d_id, user_id)
            )
            ok = cur.fetchone() is not None
            conn.commit()
            cur.close(); conn.close()
            return {"statusCode": 200 if ok else 404, "headers": cors, "body": json.dumps({"ok": ok, "status": new_status})}

        # Получаем реквизиты продавца
        cur.execute(
            "SELECT entity_type, full_name, inn, ogrnip, address, bik, bank_name, corr_account, checking_account FROM requisites WHERE user_id = %s",
            (user_id,)
        )
        row = cur.fetchone()
        seller = {}
        if row:
            keys = ["entity_type", "full_name", "inn", "ogrnip", "address", "bik", "bank_name", "corr_account", "checking_account"]
            seller = dict(zip(keys, row))

        # Создать документ реализации (акт/накладную): сохранить в БД и вернуть PDF
        if action == "document":
            doc_type = body.get("doc_type", "act")  # act | invoice_note
            items = body.get("items", [])
            total = sum(float(i.get("qty", 1)) * float(i.get("price", 0)) for i in items)
            doc_id = body.get("doc_id")

            if doc_id:
                # Уже сохранённый документ — берём его номер/дату
                cur.execute("SELECT doc_number, doc_date FROM documents WHERE id = %s AND user_id = %s", (doc_id, user_id))
                r = cur.fetchone()
                doc_number = r[0] if r else next_document_number(cur, user_id)
                doc_date_val = str(r[1]) if r and r[1] else str(datetime.date.today())
            else:
                # Новый документ — сквозной номер (общий для актов и накладных)
                doc_number = next_document_number(cur, user_id)
                doc_date_val = str(datetime.date.today())
                cur.execute("""
                    INSERT INTO documents (user_id, doc_type, doc_number, doc_date, invoice_id, invoice_number,
                        client_type, client_name, client_inn, client_ogrnip, client_address, items, total, updated_at)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
                    RETURNING id
                """, (
                    user_id, doc_type, doc_number, doc_date_val,
                    body.get("invoice_id") or body.get("id"), body.get("invoice_number", ""),
                    body.get("client_type"), body.get("client_name", ""), body.get("client_inn", ""),
                    body.get("client_ogrnip", ""), body.get("client_address", ""),
                    json.dumps(items, ensure_ascii=False), total,
                ))
                doc_id = cur.fetchone()[0]
                conn.commit()

            doc_data = {
                "doc_number": doc_number,
                "doc_date": doc_date_val,
                "invoice_number": body.get("invoice_number", ""),
                "invoice_date": body.get("invoice_date") or "",
                "items": items,
                "total": total,
                "client_name": body.get("client_name", ""),
                "client_inn": body.get("client_inn", ""),
                "client_ogrnip": body.get("client_ogrnip", ""),
                "client_address": body.get("client_address", ""),
            }
            pdf_bytes = build_document(doc_data, seller, doc_type)
            pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
            cur.close(); conn.close()
            return {
                "statusCode": 200,
                "headers": {**cors, "Content-Type": "application/json"},
                "body": json.dumps({"ok": True, "id": doc_id, "doc_type": doc_type, "doc_number": doc_number, "pdf_base64": pdf_b64})
            }

        inv_date = body.get("invoice_date") or str(datetime.date.today())
        items = body.get("items", [])
        total = sum(float(i.get("qty", 1)) * float(i.get("price", 0)) for i in items)
        existing_id = body.get("id")

        if existing_id:
            # Обновляем уже сохранённый счёт (номер не меняем)
            cur.execute("SELECT invoice_number FROM invoices WHERE id = %s AND user_id = %s", (existing_id, user_id))
            row_num = cur.fetchone()
            inv_number = row_num[0] if row_num else next_invoice_number(cur, user_id)
            cur.execute("""
                UPDATE invoices SET invoice_date=%s, client_type=%s, client_name=%s, client_inn=%s,
                    client_ogrnip=%s, client_address=%s, items=%s, total=%s, due_date=%s, comment=%s, updated_at=NOW()
                WHERE id=%s AND user_id=%s
                RETURNING id
            """, (
                inv_date, body.get("client_type"), body.get("client_name"), body.get("client_inn"),
                body.get("client_ogrnip"), body.get("client_address"),
                json.dumps(items, ensure_ascii=False), total,
                body.get("due_date") or None, body.get("comment"),
                existing_id, user_id,
            ))
        else:
            # Новый счёт — присваиваем свежий порядковый номер
            inv_number = next_invoice_number(cur, user_id)
            cur.execute("""
                INSERT INTO invoices (user_id, invoice_number, invoice_date, client_type, client_name, client_inn,
                    client_ogrnip, client_address, items, total, due_date, comment, status, updated_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'created',NOW())
                RETURNING id
            """, (
                user_id, inv_number, inv_date,
                body.get("client_type"), body.get("client_name"), body.get("client_inn"),
                body.get("client_ogrnip"), body.get("client_address"),
                json.dumps(items, ensure_ascii=False), total,
                body.get("due_date") or None, body.get("comment"),
            ))
        result = cur.fetchone()
        invoice_id = result[0] if result else existing_id
        conn.commit()

        if action == "pdf":
            invoice_data = {
                "invoice_number": inv_number,
                "invoice_date": inv_date,
                "items": items,
                "total": total,
                "due_date": body.get("due_date", ""),
                "comment": body.get("comment", ""),
                "client_name": body.get("client_name", ""),
                "client_inn": body.get("client_inn", ""),
                "client_ogrnip": body.get("client_ogrnip", ""),
                "client_address": body.get("client_address", ""),
            }
            pdf_bytes = build_pdf(invoice_data, seller)
            pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
            cur.close(); conn.close()
            return {
                "statusCode": 200,
                "headers": {**cors, "Content-Type": "application/json"},
                "body": json.dumps({"ok": True, "id": invoice_id, "invoice_number": inv_number, "pdf_base64": pdf_b64})
            }

        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True, "id": invoice_id, "invoice_number": inv_number})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "method not allowed"})}