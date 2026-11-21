"""Funciones de validación reutilizables."""
from urllib.parse import urlparse

def is_https_url(raw:str)->bool:
    parsed=urlparse(raw)
    return parsed.scheme=='https' and bool(parsed.hostname)
