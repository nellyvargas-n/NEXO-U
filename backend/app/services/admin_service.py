"""Conteos agregados para panel administrativo; sin importes privados."""
from sqlalchemy import select, func
from app.models.access import AppUser, Organization


def overview(db) -> dict:
    return {'users': db.scalar(select(func.count()).select_from(AppUser)) or 0,
            'organizations': db.scalar(select(func.count()).select_from(Organization)) or 0,
            'pending_verification': db.scalar(select(func.count()).select_from(Organization).where(
                Organization.verified.is_(False))) or 0}
