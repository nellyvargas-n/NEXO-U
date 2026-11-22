"""Consulta de notificaciones propias de una cuenta."""
from sqlalchemy import select, func
from app.models.extended import Notification


def unread_count(db, user_id: int) -> int:
    return db.scalar(select(func.count()).select_from(Notification).where(
        Notification.user_id == user_id, Notification.read.is_(False))) or 0
