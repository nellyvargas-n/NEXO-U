"""Información de usuario que es seguro devolver al frontend."""
from typing import Literal
from pydantic import BaseModel, EmailStr

class UserPublic(BaseModel):
    id: int
    email: EmailStr
    role: Literal['usuario', 'empresa', 'admin']
    active: bool
