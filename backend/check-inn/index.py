import json
import re
import urllib.request
import urllib.parse


def validate_inn_format(inn: str, entity_type: str) -> tuple[bool, str]:
    """Проверка формата ИНН"""
    if entity_type == "ip" or entity_type == "self_employed" or entity_type == "individual":
        if not re.match(r'^\d{12}$', inn):
            return False, "ИНН физлица/ИП должен содержать ровно 12 цифр"
    elif entity_type == "ooo":
        if not re.match(r'^\d{10}$', inn):
            return False, "ИНН организации должен содержать ровно 10 цифр"
    return True, ""


def validate_ogrnip_format(ogrnip: str) -> tuple[bool, str]:
    """Проверка формата ОГРНИП"""
    if not re.match(r'^\d{15}$', ogrnip):
        return False, "ОГРНИП должен содержать ровно 15 цифр"
    return True, ""


def check_inn_fns(inn: str) -> dict:
    """Запрос к открытому API ФНС для проверки ИНН"""
    try:
        url = f"https://egrul.nalog.ru/search-json?query={inn}&page=1&cnt=10"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            rows = data.get("rows", [])
            if not rows:
                return {"found": False, "closed": False}
            row = rows[0]
            # Проверяем, есть ли дата прекращения деятельности
            liquidation_date = row.get("liquidation_date") or row.get("stopDate") or row.get("КПП")
            # Более надёжная проверка закрытия через статус
            status = str(row.get("status", "")).lower()
            is_closed = (
                "ликвид" in status or
                "прекращ" in status or
                bool(row.get("liquidation_date")) or
                bool(row.get("stopDate"))
            )
            return {
                "found": True,
                "closed": is_closed,
                "name": row.get("n") or row.get("name", ""),
            }
    except Exception:
        return {"found": None, "closed": False, "error": True}


def handler(event: dict, context) -> dict:
    """Проверка ИНН или ОГРНИП через данные ФНС"""
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Неверный формат запроса"})}

    inn = (body.get("inn") or "").strip()
    ogrnip = (body.get("ogrnip") or "").strip()
    entity_type = (body.get("entity_type") or "ip").strip()

    # Проверяем ОГРНИП если передан
    if ogrnip:
        valid, err = validate_ogrnip_format(ogrnip)
        if not valid:
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({"valid": False, "message": err})
            }
        # ОГРНИП начинается с 3
        if not ogrnip.startswith("3"):
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({"valid": False, "message": "ОГРНИП должен начинаться с цифры 3"})
            }
        result = check_inn_fns(ogrnip)
    elif inn:
        valid, err = validate_inn_format(inn, entity_type)
        if not valid:
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({"valid": False, "message": err})
            }
        result = check_inn_fns(inn)
    else:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"valid": False, "message": "Укажите ИНН или ОГРНИП"})
        }

    if result.get("error"):
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"valid": False, "message": "Ошибка при сверке с сайтом ФНС. Пожалуйста, проверьте внесённые данные"})
        }

    if not result["found"]:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"valid": False, "message": "Ошибка при сверке с сайтом ФНС. Пожалуйста, проверьте внесённые данные"})
        }

    if result["closed"]:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"valid": False, "message": "Ошибка при сверке с сайтом ФНС. Пожалуйста, проверьте внесённые данные"})
        }

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"valid": True, "name": result.get("name", "")})
    }
