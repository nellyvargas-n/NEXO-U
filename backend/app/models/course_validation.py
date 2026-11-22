"""Importación pública de modelos ORM existentes sin crear tablas duplicadas."""
"""La validación de cursos se registra en Enrollment.completed y AuditLog."""
from .entities import Enrollment
from .access import AuditLog
__all__ = ["Enrollment", "AuditLog"]
