"""Importación pública de modelos ORM existentes sin crear tablas duplicadas."""
from .entities import Requirement
__all__ = ["Requirement"]
