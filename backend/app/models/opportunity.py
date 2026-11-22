"""Importación pública de modelos ORM existentes sin crear tablas duplicadas."""
from .entities import Opportunity
__all__ = ["Opportunity"]
