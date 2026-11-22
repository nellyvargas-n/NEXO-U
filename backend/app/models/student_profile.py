"""Importación pública de modelos ORM existentes sin crear tablas duplicadas."""
from .entities import Profile
from .extended import SchoolProfile
__all__ = ["Profile", "SchoolProfile"]
