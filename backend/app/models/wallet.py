"""Importación pública de modelos ORM existentes sin crear tablas duplicadas."""
"""No se crea una tabla Wallet separada: usa datos financieros por usuario."""
from .extended import FinanceEntry, FinanceBudget, FinanceObligation
__all__ = ["FinanceEntry", "FinanceBudget", "FinanceObligation"]
