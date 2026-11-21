"""Módulo IA opcional: la elegibilidad se calcula con reglas, no con LLM."""
from pydantic import BaseModel, Field
class OptionalAIExplanation(BaseModel):
    explanation:str=Field(min_length=1,max_length=2000)
