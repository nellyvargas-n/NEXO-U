"""Dependencia pública de FastAPI para módulos nuevos."""
from app.core.auth_jwt import current_user, require_role, issue_token, verify_password, hash_password
