"""Convocatorias públicas con su fuente, vencimiento y etiqueta de demo."""
from datetime import date
from pydantic import BaseModel, HttpUrl

class OpportunityRead(BaseModel):
    id: int
    title: str
    category: str
    deadline: date
    official_url: HttpUrl
    amount_bob: float
    organization: str
    verified_organization: bool
    is_demo: bool = False
