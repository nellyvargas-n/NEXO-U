"""Respuestas de validación del emisor autorizado."""
from typing import Literal
from pydantic import BaseModel

class ValidationResult(BaseModel):
    status: Literal['completed','already_completed']
    course_id: int | None = None
    student_user_id: int | None = None
