"""Importación pública de modelos ORM existentes sin crear tablas duplicadas."""
from .entities import Transaction
from .extended import FinanceEntry
__all__ = ["Transaction", "FinanceEntry"]
