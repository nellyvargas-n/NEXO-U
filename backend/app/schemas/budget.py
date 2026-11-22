"""Presupuesto mensual solo del propietario autenticado."""
from decimal import Decimal
from pydantic import BaseModel, Field

class BudgetRead(BaseModel):
    id: int
    category: str
    month: str = Field(pattern=r'^\d{4}-(0[1-9]|1[0-2])$')
    limit_bob: Decimal = Field(ge=0)
