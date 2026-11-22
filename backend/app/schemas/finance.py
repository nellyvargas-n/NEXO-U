"""Importes privados: solo universitarios adultos con JWT válido."""
from datetime import date
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field

class FinanceEntryRead(BaseModel):
    id: int
    direction: Literal['income','expense']
    amount_bob: Decimal = Field(gt=0)
    category: str
    happened_on: date
