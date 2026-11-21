"""Consultas de uso interno para Requirement; filtrar siempre por dueño en la API."""
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Requirement

def list_by_opportunity_id(db:Session,value,limit:int=100):
    return db.scalars(select(Requirement).where(Requirement.opportunity_id==value).limit(min(max(limit,1),100))).all()
