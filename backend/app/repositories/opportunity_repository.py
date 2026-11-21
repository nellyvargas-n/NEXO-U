"""Consultas de uso interno para Opportunity; filtrar siempre por dueño en la API."""
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Opportunity

def list_by_id(db:Session,value,limit:int=100):
    return db.scalars(select(Opportunity).where(Opportunity.id==value).limit(min(max(limit,1),100))).all()
