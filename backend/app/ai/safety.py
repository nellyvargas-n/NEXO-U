"""Guardas de privacidad para orientación educativa.

Nunca se envían correos, perfiles personales, finanzas, tokens ni credenciales
secretas a modelos externos. Las respuestas locales no usan proveedores remotos.
"""
from __future__ import annotations
import re

CONNECTION_RE = re.compile(r"(?:postgres(?:ql)?(?:\+psycopg)?://)[^\s]+", re.IGNORECASE)
BEARER_RE = re.compile(r"\bBearer\s+[A-Za-z0-9_.~+/-]+", re.IGNORECASE)
NEON_SECRET_RE = re.compile(r"\bnpg_[A-Za-z0-9_-]{8,}\b")
SECRET_ASSIGN_RE = re.compile(r"(?i)\b(JWT_SECRET|GEMINI_API_KEY)\s*=\s*\S+")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}")


def redact_sensitive(value: str) -> str:
    """Elimina secretos evidentes de textos de apoyo y registros."""
    value = CONNECTION_RE.sub("[conexion_oculta]", value)
    value = BEARER_RE.sub("Bearer [token_oculto]", value)
    value = NEON_SECRET_RE.sub("[clave_neon_oculta]", value)
    value = SECRET_ASSIGN_RE.sub("[clave_oculta]", value)
    return EMAIL_RE.sub("[correo_oculto]", value)


def clean_question(value: str) -> str:
    """Limita el texto a 350 caracteres y evita exponer secretos accidentales."""
    if not isinstance(value, str) or not value.strip():
        raise ValueError("Escribe una pregunta")
    cleaned = redact_sensitive(value.strip())
    if len(cleaned) > 350:
        raise ValueError("La pregunta puede tener como máximo 350 caracteres")
    return cleaned
