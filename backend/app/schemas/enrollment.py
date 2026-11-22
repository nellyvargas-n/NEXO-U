"""Inscripciones visibles únicamente para el estudiante o empresa propietaria."""
from typing import Literal
from pydantic import BaseModel

class EnrollmentRead(BaseModel):
    id: int
    course_id: int
    completed: bool
    validation_status: Literal['pendiente','validado']

class CompanyEnrollee(BaseModel):
    enrollment_id: int
    student_user_id: int
    student_name: str
    profile_type: Literal['colegial','universitario']
    completed: bool
    validation_status: str
