"""Formato uniforme de importes sin pérdida binaria."""
from decimal import Decimal

def bob(amount)->str:
    return str(Decimal(str(amount)).quantize(Decimal('0.01')))
