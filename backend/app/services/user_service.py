"""Operaciones de lectura segura de cuentas."""
from sqlalchemy import select
from app.models.access import AppUser


def public_user(user: AppUser) -> dict:
    return {'id': user.id, 'email': user.email, 'role': user.role, 'active': user.active}


def find_user_by_email(db, email: str):
    return db.scalar(select(AppUser).where(AppUser.email == email.strip().lower()))
