"""Publicaciones públicas moderables, sin perfiles bancarios."""
from datetime import datetime
from pydantic import BaseModel

class PostRead(BaseModel):
    id: int
    title: str
    body: str
    created_at: datetime
    visible: bool
