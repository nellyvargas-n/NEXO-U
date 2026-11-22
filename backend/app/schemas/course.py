"""Cursos visibles públicamente, sin datos de participantes."""
from datetime import date
from pydantic import BaseModel, Field

class CourseRead(BaseModel):
    id: int
    title: str
    end_date: date
    cost_bob: float = Field(ge=0)
    credential_kind: str
    credential_value: str
    credential_level: str | None = None
    organization: str
    sponsored: bool = False
