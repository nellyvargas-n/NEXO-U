"""Eventos publicados por organizaciones verificadas."""
from datetime import datetime
from pydantic import BaseModel, HttpUrl

class PublicEvent(BaseModel):
    id: int
    title: str
    starts_at: datetime
    public_url: HttpUrl | None = None
