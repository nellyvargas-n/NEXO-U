"""Dependencia que limita rutas por rol JWT para FastAPI."""
from app.core.auth_jwt import require_role
__all__ = ["require_role"]
