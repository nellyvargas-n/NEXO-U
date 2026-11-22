"""Cursos visibles públicamente, sin datos de participantes."""
from datetime import date
from pydantic import BaseModel, Field

class CourseRead(BaseModel):
    id: int
    title: str
    start_date: date | None = None
    end_date: date | None
    cost_bob: float = Field(ge=0)
    credential_kind: str
    credential_value: str
    credential_level: str | None = None
    duration_hours: int | None = None
    delivery_mode: str = "asincrono"
    is_demo: bool = False
    organization: str
    sponsored: bool = False
    summary: str | None = None
    official_url: str | None = None
    source_url: str | None = None
    source_kind: str | None = None
    source_checked_on: date | None = None
    is_curated: bool = False
