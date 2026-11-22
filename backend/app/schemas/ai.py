"""Orientación local: no usa un modelo generativo para decidir elegibilidad."""
from pydantic import BaseModel, Field

class QuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=350)

class ExplanationResponse(BaseModel):
    answer: str = Field(min_length=1, max_length=2000)
    source: str = 'orientacion_local'
    generative_ai_used: bool = False
