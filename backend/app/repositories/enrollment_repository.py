"""Consultas de uso interno para Enrollment; filtrar siempre por dueño en la API."""
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Enrollment

def list_by_student_id(db:Session,value,limit:int=100):
    return db.scalars(select(Enrollment).where(Enrollment.student_id==value).limit(min(max(limit,1),100))).all()
