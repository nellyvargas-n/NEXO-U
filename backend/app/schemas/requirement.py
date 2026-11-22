"""Reglas visibles del emisor: operador explícito para idioma B1, semestre, etc."""
from pydantic import BaseModel

class RequirementRead(BaseModel):
    kind: str
    operator: str
    required: str
    required_level: str | None = None
    status: str
