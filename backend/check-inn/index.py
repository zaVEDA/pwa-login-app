import json
import re
import urllib.request
import urllib.parse


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


def check_fns_egrul(query: str) -> dict:
    """Поиск юрлица (ООО) через egrul.nalog.ru"""
    try:
        url = f"https://egrul.nalog.ru/search-json?query={urllib.parse.quote(query)}&page=1&cnt=10"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            rows = data.get("rows", [])
            if not rows:
                return {"found": False}
            row = rows[0]
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
        return {"found": None, "error": True}


def check_fns_egrip(query: str) -> dict:
    """Поиск ИП через egrip.nalog.ru"""
    try:
        url = f"https://egrul.nalog.ru/search-json?query={urllib.parse.quote(query)}&page=1&cnt=10&mode=EGRIP"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            rows = data.get("rows", [])
            if not rows:
                return {"found": False}
            row = rows[0]
            status = str(row.get("status", "")).lower()
            is_closed = (
                "прекращ" in status or
                "ликвид" in status or
                bool(row.get("liquidation_date")) or
                bool(row.get("stopDate"))
            )
            name = row.get("n") or row.get("name", "")
            return {
                "found": True,
                "closed": is_closed,
                "name": name,
            }
    except Exception:
        return {"found": None, "error": True}


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

    if ogrnip:
        valid, err = validate_ogrnip_format(ogrnip)
        if not valid:
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"valid": False, "message": err})}
        if not ogrnip.startswith("3"):
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"valid": False, "message": "ОГРНИП должен начинаться с цифры 3"})}
        result = check_fns_egrip(ogrnip)

    elif inn:
        valid, err = validate_inn_format(inn, entity_type)
        if not valid:
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"valid": False, "message": err})}

        if entity_type in ("ip", "self_employed", "individual"):
            result = check_fns_egrip(inn)
            # Если в ЕГРИП не нашли — попробуем ЕГРЮЛ
            if not result.get("found"):
                result_egrul = check_fns_egrul(inn)
                if result_egrul.get("found"):
                    result = result_egrul
        else:
            result = check_fns_egrul(inn)
    else:
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"valid": False, "message": "Укажите ИНН или ОГРНИП"})}

    if result.get("error") or result.get("found") is None:
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
        "body": json.dumps({"valid": True, "name": result.get("name", "")})
    }
