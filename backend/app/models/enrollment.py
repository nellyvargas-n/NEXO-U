"""Importación pública de modelos ORM existentes sin crear tablas duplicadas."""
from .entities import Enrollment
__all__ = ["Enrollment"]
