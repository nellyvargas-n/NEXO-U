"""Importación pública de modelos ORM existentes sin crear tablas duplicadas."""
from .access import AuditLog
__all__ = ["AuditLog"]
