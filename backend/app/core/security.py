"""Utilidad compartida de backend."""
from app.core.auth_jwt import hash_password, verify_password, issue_token, current_user
