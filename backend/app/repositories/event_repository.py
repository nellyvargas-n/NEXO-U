"""Consultas de uso interno para CommunityEvent; filtrar siempre por dueño en la API."""
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.extended import CommunityEvent

def list_by_organization_id(db:Session,value,limit:int=100):
    return db.scalars(select(CommunityEvent).where(CommunityEvent.organization_id==value).limit(min(max(limit,1),100))).all()
