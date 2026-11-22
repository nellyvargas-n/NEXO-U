"""Sumas financieras exactas con Decimal, nunca flotantes."""
from decimal import Decimal


def balance_bob(entries) -> Decimal:
    total = Decimal('0.00')
    for entry in entries:
        amount = Decimal(str(entry.amount_bob))
        total += amount if entry.direction == 'income' else -amount
    return total
