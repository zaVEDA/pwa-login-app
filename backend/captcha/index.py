import json
import os
import base64
import secrets
import datetime
import random
import io
import psycopg2
from PIL import Image, ImageDraw, ImageFilter
from images_data import IMAGES_B64

IMAGE_KEYS = list(IMAGES_B64.keys())

CANVAS_W, CANVAS_H = 300, 170
PIECE_W, PIECE_H = 52, 52
BUMP_R = 9
TOLERANCE = 6
MARGIN = 24


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }


def resp(status, body):
    return {"statusCode": status, "headers": cors_headers(), "body": json.dumps(body, ensure_ascii=False)}


def piece_mask() -> Image.Image:
    """Форма пазла: квадрат с выступом справа и выемкой слева."""
    mask = Image.new("L", (PIECE_W, PIECE_H), 0)
    d = ImageDraw.Draw(mask)
    pad = BUMP_R
    d.rounded_rectangle([pad, pad, PIECE_W - pad, PIECE_H - pad], radius=6, fill=255)
    cy = PIECE_H // 2
    d.ellipse([PIECE_W - pad - BUMP_R, cy - BUMP_R, PIECE_W - pad + BUMP_R, cy + BUMP_R], fill=255)
    d.ellipse([pad - BUMP_R, cy - BUMP_R, pad + BUMP_R, cy + BUMP_R], fill=0)
    return mask


def img_to_b64(img: Image.Image, fmt="PNG") -> str:
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return base64.b64encode(buf.getvalue()).decode()


def generate_challenge() -> dict:
    raw = base64.b64decode(IMAGES_B64[random.choice(IMAGE_KEYS)])
    bg = Image.open(io.BytesIO(raw)).convert("RGB")
    bg = bg.resize((CANVAS_W, CANVAS_H))

    piece_y = random.randint(MARGIN, CANVAS_H - PIECE_H - MARGIN)
    target_x = random.randint(MARGIN + PIECE_W, CANVAS_W - PIECE_W - MARGIN)

    mask = piece_mask()

    piece_crop = bg.crop((target_x, piece_y, target_x + PIECE_W, piece_y + PIECE_H)).copy()
    piece_rgba = Image.new("RGBA", (PIECE_W, PIECE_H))
    piece_rgba.paste(piece_crop, (0, 0), mask)
    border = Image.new("L", (PIECE_W, PIECE_H), 0)
    ImageDraw.Draw(border).rectangle([0, 0, PIECE_W - 1, PIECE_H - 1], outline=255, width=2)
    outline_layer = Image.new("RGBA", (PIECE_W, PIECE_H), (255, 255, 255, 0))
    outline_layer.putalpha(Image.composite(border, Image.new("L", (PIECE_W, PIECE_H), 0), mask))
    piece_final = Image.alpha_composite(piece_rgba, outline_layer)

    bg_hole = bg.copy()
    dark = Image.new("RGB", (PIECE_W, PIECE_H), (30, 24, 18))
    hole_area = Image.composite(dark, bg_hole.crop((target_x, piece_y, target_x + PIECE_W, piece_y + PIECE_H)), mask.point(lambda p: int(p * 0.72)))
    bg_hole.paste(hole_area, (target_x, piece_y))
    outline_img = bg_hole.crop((target_x, piece_y, target_x + PIECE_W, piece_y + PIECE_H))
    ImageDraw.Draw(outline_img).bitmap((0, 0), mask.filter(ImageFilter.FIND_EDGES), fill=(255, 240, 220))
    bg_hole.paste(outline_img, (target_x, piece_y))

    token = secrets.token_urlsafe(24)
    return {
        "token": token,
        "target_x": target_x,
        "piece_y": piece_y,
        "bg_b64": img_to_b64(bg_hole, "JPEG"),
        "piece_b64": img_to_b64(piece_final, "PNG"),
        "canvas_w": CANVAS_W,
        "canvas_h": CANVAS_H,
        "piece_w": PIECE_W,
        "piece_h": PIECE_H,
    }


def handler(event: dict, context) -> dict:
    """Пазл-капча: генерация картинки капибары с вырезанным фрагментом и проверка позиции ползунка перед отправкой SMS."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    if event.get("httpMethod") != "POST":
        return resp(405, {"error": "method not allowed"})

    body = json.loads(event.get("body") or "{}")
    action = body.get("action", "")

    conn = get_conn()
    cur = conn.cursor()
    try:
        if action == "generate":
            ch = generate_challenge()
            expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
            cur.execute(
                "INSERT INTO captcha_challenges (token, target_x, tolerance, canvas_width, canvas_height, piece_width, piece_height, piece_y, expires_at) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (ch["token"], ch["target_x"], TOLERANCE, ch["canvas_w"], ch["canvas_h"], ch["piece_w"], ch["piece_h"], ch["piece_y"], expires)
            )
            conn.commit()
            return resp(200, {
                "token": ch["token"],
                "background": f"data:image/jpeg;base64,{ch['bg_b64']}",
                "piece": f"data:image/png;base64,{ch['piece_b64']}",
                "canvas_width": ch["canvas_w"],
                "canvas_height": ch["canvas_h"],
                "piece_width": ch["piece_w"],
                "piece_height": ch["piece_h"],
                "piece_y": ch["piece_y"],
            })

        if action == "verify":
            token = body.get("token", "")
            x = body.get("x")
            if not token or x is None:
                return resp(400, {"error": "Некорректный запрос"})

            cur.execute(
                "SELECT id, target_x, tolerance, attempts, verified, expires_at FROM captcha_challenges WHERE token = %s",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Капча устарела, обновите картинку"})
            cid, target_x, tolerance, attempts, verified, expires_at = row

            if expires_at < datetime.datetime.utcnow():
                return resp(410, {"error": "Капча устарела, обновите картинку"})

            if verified:
                return resp(400, {"error": "Капча уже пройдена"})

            if attempts >= 5:
                return resp(429, {"error": "Слишком много попыток, обновите картинку"})

            cur.execute("UPDATE captcha_challenges SET attempts = attempts + 1 WHERE id = %s", (cid,))

            if abs(int(x) - target_x) <= tolerance:
                pass_token = secrets.token_urlsafe(24)
                cur.execute(
                    "UPDATE captcha_challenges SET verified = TRUE, pass_token = %s WHERE id = %s",
                    (pass_token, cid)
                )
                conn.commit()
                return resp(200, {"ok": True, "pass_token": pass_token})

            conn.commit()
            left = max(0, 4 - attempts)
            return resp(200, {"ok": False, "attempts_left": left})

        return resp(400, {"error": "unknown action"})
    finally:
        cur.close()
        conn.close()