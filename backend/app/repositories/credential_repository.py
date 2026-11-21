"""Consultas de uso interno para Credential; filtrar siempre por dueño en la API."""
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Credential

def list_by_student_id(db:Session,value,limit:int=100):
    return db.scalars(select(Credential).where(Credential.student_id==value).limit(min(max(limit,1),100))).all()
