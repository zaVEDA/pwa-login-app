import json
import os
import re
import urllib.request


def validate_inn_format(inn: str, entity_type: str) -> tuple[bool, str]:
    """Проверка формата ИНН"""
    if entity_type in ("ip", "self_employed", "individual"):
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


def check_dadata(query: str) -> dict:
    """Проверка ИНН/ОГРНИП через Dadata (реестр ФНС)"""
    api_key = os.environ.get("DADATA_API_KEY", "")
    url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party"
    payload = json.dumps({"query": query, "count": 1}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Token {api_key}",
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode("utf-8"))
        suggestions = data.get("suggestions", [])
        if not suggestions:
            return {"found": False}
        item = suggestions[0]
        d = item.get("data", {})
        status = d.get("state", {}).get("status", "")
        is_closed = status in ("LIQUIDATED", "REORGANIZED")
        name = item.get("value", "") or d.get("name", {}).get("full_with_opf", "")
        ogrnip = d.get("ogrn", "") or ""
        inn = d.get("inn", "") or ""
        return {"found": True, "closed": is_closed, "name": name, "ogrnip": ogrnip, "inn": inn}


def handler(event: dict, context) -> dict:
    """Проверка ИНН или ОГРНИП через Dadata (реестр ФНС)"""
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

    if ogrnip:
        valid, err = validate_ogrnip_format(ogrnip)
        if not valid:
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"valid": False, "message": err})}
        if not ogrnip.startswith("3"):
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"valid": False, "message": "ОГРНИП должен начинаться с цифры 3"})}
        query = ogrnip
    elif inn:
        valid, err = validate_inn_format(inn, entity_type)
        if not valid:
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"valid": False, "message": err})}
        query = inn
    else:
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"valid": False, "message": "Укажите ИНН или ОГРНИП"})}

    try:
        result = check_dadata(query)
    except Exception:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"valid": False, "message": "Не удалось получить ответ от ФНС. Попробуйте ещё раз"})
        }

    if not result["found"]:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"valid": False, "message": "ИНН не найден в реестре ФНС"})
        }

    if result["closed"]:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"valid": False, "message": "Деятельность по данному ИНН прекращена"})
        }

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"valid": True, "name": result.get("name", ""), "ogrnip": result.get("ogrnip", ""), "inn": result.get("inn", "")})
    }