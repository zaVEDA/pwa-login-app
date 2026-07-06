import json
import os
import psycopg2
import io
import base64
import datetime
import qrcode
from reportlab.lib.pagesizes import A4, landscape
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


_UNITS_M = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
_UNITS_F = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
_TEENS = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
          "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"]
_TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"]
_HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"]


def _three_digit_words(n: int, feminine: bool = False) -> list:
    words = []
    h, r = n // 100, n % 100
    if h:
        words.append(_HUNDREDS[h])
    if 10 <= r < 20:
        words.append(_TEENS[r - 10])
    else:
        t, u = r // 10, r % 10
        if t:
            words.append(_TENS[t])
        if u:
            words.append((_UNITS_F if feminine else _UNITS_M)[u])
    return words


def _plural(n: int, forms: tuple) -> str:
    n_abs = abs(n) % 100
    if 11 <= n_abs <= 19:
        return forms[2]
    n1 = n_abs % 10
    if n1 == 1:
        return forms[0]
    if 2 <= n1 <= 4:
        return forms[1]
    return forms[2]


def rub_words(amount) -> str:
    """Сумма прописью, например: «Двенадцать тысяч семьсот двадцать рублей 00 копеек»."""
    amount = round(float(amount or 0), 2)
    total_rub = int(amount)
    kop = int(round((amount - total_rub) * 100))
    rub = total_rub

    if rub == 0:
        words = ["ноль"]
    else:
        words = []
        billions, rub = rub // 1_000_000_000, rub % 1_000_000_000
        millions, rub = rub // 1_000_000, rub % 1_000_000
        thousands, rub = rub // 1000, rub % 1000
        units = rub

        if billions:
            words += _three_digit_words(billions) + [_plural(billions, ("миллиард", "миллиарда", "миллиардов"))]
        if millions:
            words += _three_digit_words(millions) + [_plural(millions, ("миллион", "миллиона", "миллионов"))]
        if thousands:
            words += _three_digit_words(thousands, feminine=True) + [_plural(thousands, ("тысяча", "тысячи", "тысяч"))]
        if units or not words:
            words += _three_digit_words(units)

    text = " ".join(words).strip()
    text = (text[0].upper() + text[1:]) if text else "Ноль"
    rub_form = _plural(total_rub, ("рубль", "рубля", "рублей"))
    kop_form = _plural(kop, ("копейка", "копейки", "копеек"))
    return f"{text} {rub_form} {kop:02d} {kop_form}"


def build_torg12(invoice: dict, seller: dict) -> bytes:
    """Унифицированная форма № ТОРГ-12 (пост. Госкомстата России от 25.12.1998 № 132).
    Вёрстка воспроизводит структуру и пропорции официального бланка: шапка со сторонами
    сделки и блоком кодов справа, таблица товаров из 15 граф с нумерованной строкой,
    и итоговый блок с подписями."""
    ensure_fonts()
    buf = io.BytesIO()
    PAGE_W = 277 * mm  # рабочая ширина листа A4 landscape за вычетом полей
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4),
                            leftMargin=10*mm, rightMargin=10*mm,
                            topMargin=8*mm, bottomMargin=8*mm)

    grid_color = colors.HexColor("#333333")
    tiny = ParagraphStyle("Tiny", fontName="DejaVuSans", fontSize=6.5, leading=8)
    tiny_b = ParagraphStyle("TinyB", fontName="DejaVuSans-Bold", fontSize=6.5, leading=8)
    tiny_c = ParagraphStyle("TinyC", fontName="DejaVuSans", fontSize=6.5, leading=8, alignment=TA_CENTER)
    tiny_bc = ParagraphStyle("TinyBC", fontName="DejaVuSans-Bold", fontSize=6.5, leading=8, alignment=TA_CENTER)
    small = ParagraphStyle("Small", fontName="DejaVuSans", fontSize=7.5, leading=9.5)
    small_b = ParagraphStyle("SmallB", fontName="DejaVuSans-Bold", fontSize=7.5, leading=9.5)
    normal_b = ParagraphStyle("NB", fontName="DejaVuSans-Bold", fontSize=9, leading=11, alignment=TA_CENTER)
    title_style = ParagraphStyle("T", fontName="DejaVuSans-Bold", fontSize=14, leading=17, alignment=TA_CENTER)

    items = invoice.get("items", [])
    total = invoice.get("total", 0)
    doc_num = invoice.get("doc_number") or invoice.get("invoice_number", "—")
    doc_date = invoice.get("doc_date") or invoice.get("invoice_date", str(datetime.date.today()))
    basis_num = invoice.get("invoice_number", "")
    basis_date = invoice.get("invoice_date", "")

    client_name = invoice.get("client_name", "") or "—"
    client_inn = invoice.get("client_inn", "")
    client_kpp = invoice.get("client_kpp", "")
    client_address = invoice.get("client_address", "")

    seller_name = seller.get("full_name", "")
    seller_inn = seller.get("inn", "")
    seller_kpp = seller.get("kpp", "")
    seller_address = seller.get("address", "")
    seller_okpo = seller.get("okpo", "")
    bank_name = seller.get("bank_name", "")
    bik = seller.get("bik", "")
    checking = seller.get("checking_account", "")
    is_ip = seller.get("entity_type") == "ip"
    seller_display = (f"ИП {seller_name}" if is_ip else seller_name) or "—"

    seller_line = seller_display
    if seller_inn:
        seller_line += f", ИНН {seller_inn}"
    if seller_kpp:
        seller_line += f", КПП {seller_kpp}"
    if seller_address:
        seller_line += f", {seller_address}"
    if bank_name:
        seller_line += f", р/с {checking or '—'} в {bank_name}, БИК {bik or '—'}, к/с {seller.get('corr_account') or '—'}"

    client_line = client_name
    if client_inn:
        client_line += f", ИНН {client_inn}"
    if client_kpp:
        client_line += f", КПП {client_kpp}"
    if client_address:
        client_line += f", {client_address}"

    basis_line = f"Договор" + (f" (счёт № {basis_num} от {fmt_date(basis_date)})" if basis_num else "")

    story = []

    # ── Шапка: стороны сделки (слева) + коды (справа), единая таблица ──
    LABEL_W = 46 * mm
    VALUE_W = 148 * mm
    CODE_LABEL_W = 46 * mm
    CODE_VALUE_W = PAGE_W - LABEL_W - VALUE_W - CODE_LABEL_W

    header_data = [
        [Paragraph("Грузоотправитель и его адрес, банковские реквизиты", tiny_b), Paragraph(seller_line, tiny),
         Paragraph("Форма по ОКУД", tiny), Paragraph("0330212", tiny_bc)],
        [Paragraph("Грузополучатель и его адрес, банковские реквизиты", tiny_b), Paragraph(client_line, tiny),
         Paragraph("по ОКПО", tiny), Paragraph("—", tiny_c)],
        [Paragraph("Поставщик и его адрес, банковские реквизиты", tiny_b), Paragraph(seller_line, tiny),
         Paragraph("по ОКПО", tiny), Paragraph(seller_okpo or "—", tiny_c)],
        [Paragraph("Плательщик и его адрес, банковские реквизиты", tiny_b), Paragraph(client_line, tiny),
         Paragraph("по ОКПО", tiny), Paragraph("—", tiny_c)],
        [Paragraph("Основание", tiny_b), Paragraph(basis_line, tiny),
         Paragraph("Вид деятельности по ОКДП", tiny), Paragraph("—", tiny_c)],
    ]
    header_table = Table(header_data, colWidths=[LABEL_W, VALUE_W, CODE_LABEL_W, CODE_VALUE_W])
    header_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, grid_color),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (3, 0), (3, 0), colors.HexColor("#FBE4C4")),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(header_table)

    # ── Номер документа / Дата составления, справа под кодами ──
    doc_box = Table([
        [Paragraph("Номер\nдокумента", tiny_c), Paragraph("Дата\nсоставления", tiny_c)],
        [Paragraph(str(doc_num), normal_b), Paragraph(fmt_date(doc_date), normal_b)],
    ], colWidths=[CODE_LABEL_W, CODE_VALUE_W])
    doc_box.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, grid_color),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    title_box = Table([[
        Paragraph("ТОВАРНАЯ НАКЛАДНАЯ", title_style),
        doc_box,
    ]], colWidths=[LABEL_W + VALUE_W, CODE_LABEL_W + CODE_VALUE_W])
    title_box.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(title_box)
    story.append(Spacer(1, 3*mm))

    # ── Таблица товаров: 15 граф, с нумерованной строкой ──
    group_headers = [
        Paragraph("№\nп/п", tiny_bc),
        Paragraph("Наименование, характеристика, сорт,\nартикул товара", tiny_bc),
        Paragraph("Код", tiny_bc),
        Paragraph("Единица измерения", tiny_bc), "",
        Paragraph("Вид\nупаковки", tiny_bc),
        Paragraph("Количество", tiny_bc), "",
        Paragraph("Масса\nбрутто", tiny_bc),
        Paragraph("Количество\n(масса нетто)", tiny_bc),
        Paragraph("Цена,\nруб. коп.", tiny_bc),
        Paragraph("Сумма без учёта\nНДС, руб. коп.", tiny_bc),
        Paragraph("НДС", tiny_bc), "",
        Paragraph("Сумма с учётом\nНДС, руб. коп.", tiny_bc),
    ]
    sub_headers = [
        "", "", "",
        Paragraph("наименование", tiny_c), Paragraph("код по ОКЕИ", tiny_c),
        "",
        Paragraph("в одном\nместе", tiny_c), Paragraph("количество\nмест", tiny_c),
        "", "", "", "",
        Paragraph("ставка,\n%", tiny_c), Paragraph("сумма,\nруб. коп.", tiny_c),
        "",
    ]
    number_row = [Paragraph(str(n), tiny_bc) for n in range(1, 16)]

    col_pct = [3, 24, 4, 6, 5, 5, 5, 5, 6, 7, 8, 9, 5, 7, 9]
    col_widths = [PAGE_W * p / sum(col_pct) for p in col_pct]

    table_data = [group_headers, sub_headers, number_row]
    for idx, item in enumerate(items, 1):
        qty = float(item.get("qty", 1))
        price = float(item.get("price", 0))
        amount = qty * price
        vat_rate = item.get("vat_rate", "no_vat")
        vat_label = {"no_vat": "Без НДС", "5": "5%", "7": "7%", "10": "10%", "22": "22%"}.get(vat_rate, "Без НДС")
        vat_sum = "—" if vat_rate == "no_vat" else f"{amount * float(vat_rate) / 100:,.2f}"
        amount_with_vat = amount if vat_rate == "no_vat" else amount + float(vat_sum.replace(",", ""))
        table_data.append([
            Paragraph(str(idx), tiny_c),
            Paragraph(item.get("name", ""), tiny),
            Paragraph("—", tiny_c),
            Paragraph(item.get("unit", "шт"), tiny_c),
            Paragraph(item.get("okei", "796"), tiny_c),
            Paragraph("—", tiny_c),
            Paragraph(f"{qty:g}", tiny_c),
            Paragraph("1", tiny_c),
            Paragraph("—", tiny_c),
            Paragraph(f"{qty:g}", tiny_c),
            Paragraph(f"{price:,.2f}", tiny_c),
            Paragraph(f"{amount:,.2f}", tiny_c),
            Paragraph(vat_label, tiny_c),
            Paragraph(vat_sum, tiny_c),
            Paragraph(f"{amount_with_vat:,.2f}", tiny_c),
        ])
    table_data.append([
        "", Paragraph("Итого", tiny_bc), "", "", "", "", "", "", "", "",
        "", Paragraph(f"{total:,.2f}", tiny_bc), "", "", Paragraph(f"{total:,.2f}", tiny_bc),
    ])

    items_table = Table(table_data, colWidths=col_widths, repeatRows=3)
    items_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, grid_color),
        ("SPAN", (0, 0), (0, 1)),   # № п/п
        ("SPAN", (1, 0), (1, 1)),   # Наименование
        ("SPAN", (2, 0), (2, 1)),   # Код
        ("SPAN", (3, 0), (4, 0)),   # Единица измерения
        ("SPAN", (5, 0), (5, 1)),   # Вид упаковки
        ("SPAN", (6, 0), (7, 0)),   # Количество
        ("SPAN", (8, 0), (8, 1)),   # Масса брутто
        ("SPAN", (9, 0), (9, 1)),   # Количество (масса нетто)
        ("SPAN", (10, 0), (10, 1)),  # Цена
        ("SPAN", (11, 0), (11, 1)),  # Сумма без НДС
        ("SPAN", (12, 0), (13, 0)),  # НДС
        ("SPAN", (14, 0), (14, 1)),  # Сумма с учётом НДС
        ("BACKGROUND", (0, 0), (-1, 1), colors.HexColor("#F5F0E8")),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#EDEDED")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("ALIGN", (1, 3), (1, -2), "LEFT"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("SPAN", (0, -1), (1, -1)),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph("Товарная накладная имеет приложение на —— листах, порядковые номера записей ——", small))
    story.append(Paragraph(f"Всего мест —— &nbsp;&nbsp;&nbsp; Масса груза (нетто) —— &nbsp;&nbsp;&nbsp; Масса груза (брутто) ——", small))
    story.append(Paragraph("Приложение (паспорта, сертификаты и т. п.) на —— листах", small))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(f"<b>Всего отпущено на сумму {rub_words(total)}</b>", small_b))
    story.append(Paragraph("По доверенности № —— от ——, выданной ——", small))
    story.append(Spacer(1, 6*mm))

    sign_data = [
        [Paragraph("Отпуск груза разрешил", small), Paragraph(seller_display, small), Paragraph("_______________ / подпись", tiny)],
        [Paragraph("Главный (старший) бухгалтер", small), Paragraph("", small), Paragraph("_______________ / подпись", tiny)],
        [Paragraph("Отпуск груза произвёл", small), Paragraph("", small), Paragraph("_______________ / подпись", tiny)],
        [Paragraph("М.П.", small), Paragraph("", small), Paragraph("", small)],
        [Paragraph("", small), Paragraph("", small), Paragraph("", small)],
        [Paragraph("Груз принял грузополучатель", small), Paragraph(client_name, small), Paragraph("_______________ / подпись", tiny)],
        [Paragraph("Груз получил грузополучатель", small), Paragraph("", small), Paragraph("_______________ / подпись", tiny)],
        [Paragraph("М.П.", small), Paragraph("", small), Paragraph("", small)],
    ]
    sign_table = Table(sign_data, colWidths=[PAGE_W*0.28, PAGE_W*0.47, PAGE_W*0.25])
    sign_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("LINEBELOW", (1, 0), (1, 0), 0.4, grid_color),
        ("LINEBELOW", (1, 5), (1, 5), 0.4, grid_color),
    ]))
    story.append(sign_table)

    doc.build(story)
    buf.seek(0)
    return buf.read()


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


def build_document(invoice: dict, seller: dict, doc_type: str, doc_format: str = "simple") -> bytes:
    """Акт выполненных работ или Товарная накладная (простая / ТОРГ-12 / УПД) на основе данных счёта."""
    if doc_type != "act" and doc_format == "torg12":
        return build_torg12(invoice, seller)

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
    is_torg12 = (not is_act) and doc_format == "torg12"
    is_upd = doc_format == "upd"

    if is_act:
        head = f"АКТ № {doc_num}"
        subhead = "выполненных работ (оказанных услуг)"
        col_name = "Наименование работы, услуги"
    elif is_torg12:
        head = f"ТОВАРНАЯ НАКЛАДНАЯ (ТОРГ-12) № {doc_num}"
        subhead = "унифицированная форма № ТОРГ-12"
        col_name = "Наименование товара"
    elif is_upd:
        head = f"УНИВЕРСАЛЬНЫЙ ПЕРЕДАТОЧНЫЙ ДОКУМЕНТ № {doc_num}"
        subhead = "статус 1 — счёт-фактура и передаточный документ (акт)"
        col_name = "Наименование товара, работы, услуги"
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
    elif is_upd:
        story.append(Paragraph(
            "Документ составлен в соответствии с требованиями законодательства РФ и может быть использован "
            "для подтверждения фактов хозяйственной жизни в целях бухгалтерского и налогового учёта.",
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
    if is_torg12 or is_upd:
        sign_data.insert(2, [Paragraph("Отпуск груза разрешил / Груз принял", small), Paragraph("Груз получил грузополучатель", small)])
        sign_data.insert(3, [Paragraph("_______________ / подпись", small), Paragraph("_______________ / подпись", small)])
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
                """SELECT id, doc_type, doc_format, doc_number, doc_date, invoice_number, client_type, client_name,
                    client_inn, client_kpp, client_ogrnip, client_address, items, total, status
                   FROM documents WHERE id = %s AND user_id = %s""",
                (qs.get("document_id"), user_id)
            )
            row = cur.fetchone()
            cur.close(); conn.close()
            if not row:
                return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
            keys = ["id", "doc_type", "doc_format", "doc_number", "doc_date", "invoice_number", "client_type", "client_name",
                    "client_inn", "client_kpp", "client_ogrnip", "client_address", "items", "total", "status"]
            d = dict(zip(keys, row))
            if d["doc_date"]: d["doc_date"] = str(d["doc_date"])
            if d["total"] is not None: d["total"] = float(d["total"])
            if isinstance(d["items"], str):
                try: d["items"] = json.loads(d["items"])
                except (ValueError, TypeError): d["items"] = []
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"document": d}, ensure_ascii=False)}

        # Данные документа в стандартизированном JSON (для бота / внешних систем):
        # form/document/parties/positions/totals — готово для подстановки в шаблон
        if qs.get("document_json"):
            cur.execute(
                """SELECT id, doc_type, doc_format, doc_number, doc_date, invoice_number, invoice_date, client_name,
                    client_inn, client_kpp, client_ogrnip, client_address, items, total
                   FROM documents WHERE id = %s AND user_id = %s""",
                (qs.get("document_json"), user_id)
            )
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
            (d_id, doc_type, doc_format, doc_number, doc_date, invoice_number, invoice_date, client_name,
             client_inn, client_kpp, client_ogrnip, client_address, items, total) = row

            cur.execute(
                "SELECT entity_type, full_name, inn, kpp, ogrnip, address, bik, bank_name, corr_account, checking_account, okpo FROM requisites WHERE user_id = %s",
                (user_id,)
            )
            s_row = cur.fetchone()
            cur.close(); conn.close()
            s_keys = ["entity_type", "full_name", "inn", "kpp", "ogrnip", "address", "bik", "bank_name", "corr_account", "checking_account", "okpo"]
            s = dict(zip(s_keys, s_row)) if s_row else {}

            if isinstance(items, str):
                try: items = json.loads(items)
                except (ValueError, TypeError): items = []
            total = float(total) if total is not None else 0.0
            is_ip = s.get("entity_type") == "ip"
            seller_name = (f"ИП {s.get('full_name')}" if is_ip and s.get("full_name") else s.get("full_name")) or ""

            positions = []
            total_qty = 0.0
            for i, item in enumerate(items, 1):
                qty = float(item.get("qty", 1))
                price = float(item.get("price", 0))
                amount = qty * price
                vat_rate = item.get("vat_rate", "no_vat")
                vat_pct = 0.0 if vat_rate == "no_vat" else float(vat_rate)
                vat_amount = round(amount * vat_pct / 100, 2)
                total_qty += qty
                positions.append({
                    "line": i,
                    "nomenclature": item.get("name", ""),
                    "code": item.get("code", ""),
                    "unit": item.get("unit", "шт"),
                    "quantity": qty,
                    "price_without_vat": round(price, 2),
                    "vat_rate": "Без НДС" if vat_rate == "no_vat" else f"{vat_pct:g}%",
                    "vat_amount": vat_amount,
                    "amount_with_vat": round(amount + vat_amount, 2),
                })
            total_vat = round(sum(p["vat_amount"] for p in positions), 2)

            result = {
                "form": "ТОРГ-12" if doc_format == "torg12" else ("АКТ" if doc_type == "act" else "Товарная накладная"),
                "year": datetime.date.today().year,
                "document": {
                    "number": doc_number,
                    "date": str(doc_date) if doc_date else "",
                },
                "parties": {
                    "supplier": {
                        "name": seller_name,
                        "inn": s.get("inn", ""),
                        "kpp": s.get("kpp", ""),
                        "address": s.get("address", ""),
                        "bank_details": f"БИК {s.get('bik', '')}, р/с {s.get('checking_account', '')} в {s.get('bank_name', '')}",
                    },
                    "buyer": {
                        "name": client_name or "",
                        "inn": client_inn or "",
                        "kpp": client_kpp or "",
                        "address": client_address or "",
                    },
                },
                "basis": {
                    "type": "счёт" if invoice_number else "",
                    "number": invoice_number or "",
                    "date": str(invoice_date) if invoice_date else "",
                },
                "positions": positions,
                "totals": {
                    "total_lines": len(positions),
                    "total_quantity": total_qty,
                    "total_amount_without_vat": round(total, 2),
                    "total_vat_amount": total_vat,
                    "total_amount_with_vat": round(total + total_vat, 2),
                    "total_amount_words": rub_words(total + total_vat),
                },
            }
            return {"statusCode": 200, "headers": cors, "body": json.dumps(result, ensure_ascii=False)}

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
                UPDATE documents SET doc_type=%s, doc_format=%s, doc_date=%s, client_type=%s, client_name=%s, client_inn=%s,
                    client_kpp=%s, client_ogrnip=%s, client_address=%s, items=%s, total=%s, updated_at=NOW()
                WHERE id=%s AND user_id=%s RETURNING id, doc_number
            """, (
                body.get("doc_type", "act"),
                body.get("doc_format", "simple"),
                body.get("doc_date") or str(datetime.date.today()),
                body.get("client_type"), body.get("client_name", ""),
                body.get("client_inn", ""), body.get("client_kpp", ""), body.get("client_ogrnip", ""), body.get("client_address", ""),
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
            if new_status not in ("created", "issued", "paid", "deleted"):
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
            "SELECT entity_type, full_name, inn, ogrnip, address, bik, bank_name, corr_account, checking_account, okpo, kpp FROM requisites WHERE user_id = %s",
            (user_id,)
        )
        row = cur.fetchone()
        seller = {}
        if row:
            keys = ["entity_type", "full_name", "inn", "ogrnip", "address", "bik", "bank_name", "corr_account", "checking_account", "okpo", "kpp"]
            seller = dict(zip(keys, row))

        # Создать документ реализации (акт/накладную): сохранить в БД и вернуть PDF
        if action == "document":
            doc_type = body.get("doc_type", "act")  # act | invoice_note
            doc_format = body.get("doc_format", "simple")  # simple | torg12 | upd
            items = body.get("items", [])
            total = sum(float(i.get("qty", 1)) * float(i.get("price", 0)) for i in items)
            doc_id = body.get("doc_id")

            if doc_id:
                # Уже сохранённый документ — берём его номер/дату
                cur.execute("SELECT doc_number, doc_date FROM documents WHERE id = %s AND user_id = %s", (doc_id, user_id))
                r = cur.fetchone()
                doc_number = r[0] if r else next_document_number(cur, user_id)
                doc_date_val = str(r[1]) if r and r[1] else str(datetime.date.today())
                cur.execute("UPDATE documents SET doc_format=%s, updated_at=NOW() WHERE id=%s AND user_id=%s", (doc_format, doc_id, user_id))
                conn.commit()
            else:
                # Новый документ — сквозной номер (общий для актов и накладных)
                doc_number = next_document_number(cur, user_id)
                doc_date_val = str(datetime.date.today())
                cur.execute("""
                    INSERT INTO documents (user_id, doc_type, doc_format, doc_number, doc_date, invoice_id, invoice_number,
                        client_type, client_name, client_inn, client_kpp, client_ogrnip, client_address, items, total, updated_at)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
                    RETURNING id
                """, (
                    user_id, doc_type, doc_format, doc_number, doc_date_val,
                    body.get("invoice_id") or body.get("id"), body.get("invoice_number", ""),
                    body.get("client_type"), body.get("client_name", ""), body.get("client_inn", ""),
                    body.get("client_kpp", ""), body.get("client_ogrnip", ""), body.get("client_address", ""),
                    json.dumps(items, ensure_ascii=False), total,
                ))
                doc_id = cur.fetchone()[0]
                conn.commit()

            # Только создать/сохранить документ без генерации PDF (для открытия в редакторе)
            if body.get("no_pdf"):
                cur.close(); conn.close()
                return {
                    "statusCode": 200,
                    "headers": {**cors, "Content-Type": "application/json"},
                    "body": json.dumps({"ok": True, "id": doc_id, "doc_type": doc_type, "doc_format": doc_format, "doc_number": doc_number})
                }

            doc_data = {
                "doc_number": doc_number,
                "doc_date": doc_date_val,
                "invoice_number": body.get("invoice_number", ""),
                "invoice_date": body.get("invoice_date") or "",
                "items": items,
                "total": total,
                "client_name": body.get("client_name", ""),
                "client_inn": body.get("client_inn", ""),
                "client_kpp": body.get("client_kpp", ""),
                "client_ogrnip": body.get("client_ogrnip", ""),
                "client_address": body.get("client_address", ""),
            }
            pdf_bytes = build_document(doc_data, seller, doc_type, doc_format)
            pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
            cur.close(); conn.close()
            return {
                "statusCode": 200,
                "headers": {**cors, "Content-Type": "application/json"},
                "body": json.dumps({"ok": True, "id": doc_id, "doc_type": doc_type, "doc_format": doc_format, "doc_number": doc_number, "pdf_base64": pdf_b64})
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