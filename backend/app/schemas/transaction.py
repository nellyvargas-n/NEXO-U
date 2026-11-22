"""Contrato histórico de movimiento; las finanzas nuevas usan FinanceEntryRead."""
from app.schemas.finance import FinanceEntryRead
TransactionRead = FinanceEntryRead
__all__ = ['TransactionRead']
