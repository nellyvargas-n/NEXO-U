"""Eventos publicados futuros, sin revelar datos de contactos privados."""
from datetime import datetime, timezone
from sqlalchemy import select
from app.models.extended import CommunityEvent


def upcoming_public_events(db, limit: int = 30):
    return list(db.scalars(select(CommunityEvent).where(CommunityEvent.published.is_(True),
        CommunityEvent.starts_at >= datetime.now(timezone.utc)).order_by(
        CommunityEvent.starts_at).limit(min(max(1,limit),100))).all())
