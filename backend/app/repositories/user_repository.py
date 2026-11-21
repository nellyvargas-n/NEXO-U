"""Consultas de uso interno para AppUser; filtrar siempre por dueño en la API."""
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.access import AppUser

def list_by_email(db:Session,value,limit:int=100):
    return db.scalars(select(AppUser).where(AppUser.email==value).limit(min(max(limit,1),100))).all()
