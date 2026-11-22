"""Origen y nivel de credenciales que se muestran al estudiante."""
from typing import Literal
from pydantic import BaseModel, Field

class CredentialCreate(BaseModel):
    kind: Literal['skill','language','certificate']
    value: str = Field(min_length=1, max_length=120)
    level: str | None = Field(default=None, max_length=20)

class CredentialRead(CredentialCreate):
    id: int
    verified: bool
    issuer: str | None = None
