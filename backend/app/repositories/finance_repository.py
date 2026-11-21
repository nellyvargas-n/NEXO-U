"""Consultas de uso interno para FinanceEntry; filtrar siempre por dueño en la API."""
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.extended import FinanceEntry

def list_by_user_id(db:Session,value,limit:int=100):
    return db.scalars(select(FinanceEntry).where(FinanceEntry.user_id==value).limit(min(max(limit,1),100))).all()
