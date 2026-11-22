"""Notificaciones privadas de cuenta: no contienen información bancaria."""
from datetime import datetime
from pydantic import BaseModel

class NotificationRead(BaseModel):
    id: int
    title: str
    message: str
    read: bool
    created_at: datetime
