"""Cálculo puro de presupuesto mensual privado, sin solicitudes externas."""
from decimal import Decimal


def available_budget(limit_bob: Decimal, expenses_bob: Decimal) -> Decimal:
    return Decimal(limit_bob) - Decimal(expenses_bob)
