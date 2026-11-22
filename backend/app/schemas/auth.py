"""Contratos públicos para registro y tokens; la autorización se comprueba en el servidor."""
from typing import Literal
from pydantic import BaseModel, EmailStr, Field

class RegistrationRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    role: Literal['usuario', 'empresa']

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal['bearer'] = 'bearer'
    role: Literal['usuario', 'empresa', 'admin']
