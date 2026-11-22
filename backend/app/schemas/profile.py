"""Perfiles escolares y universitarios: nunca se comparten con una empresa sin permiso."""
from decimal import Decimal
from pydantic import BaseModel, Field

class UniversityProfile(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    career: str = Field(min_length=2, max_length=120)
    semester: int = Field(ge=1, le=20)
    age: int = Field(ge=13, le=110)
    city: str = Field(min_length=2, max_length=120)

class SchoolProfileInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=2, max_length=120)
    graduation_year: int = Field(ge=2020, le=2100)
    average_grade: Decimal = Field(ge=0, le=100)
    math_grade: Decimal = Field(ge=0, le=100)
