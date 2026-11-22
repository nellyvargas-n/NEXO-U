"""Matching determinista: compatible no implica admisión o beca concedida."""
from pydantic import BaseModel, Field
from app.schemas.requirement import RequirementRead

class MatchingOpportunity(BaseModel):
    opportunity_id: int
    title: str
    deadline: str | None
    met: int = Field(ge=0)
    total: int = Field(gt=0)
    percent: int = Field(ge=0, le=100)
    eligible: bool
    profile_type: str
    is_demo: bool = False
    requirements: list[dict]
