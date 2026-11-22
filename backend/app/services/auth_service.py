"""Funciones reutilizables de autenticación: contraseñas siempre hasheadas.

El login público se implementa en endpoints/role_access.py.
"""
from app.core.auth_jwt import hash_password, verify_password, issue_token


def normalize_email(email: str) -> str:
    return email.strip().lower()
