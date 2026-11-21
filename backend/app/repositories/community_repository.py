"""Consultas de uso interno para CommunityPost; filtrar siempre por dueño en la API."""
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.extended import CommunityPost

def list_by_author_user_id(db:Session,value,limit:int=100):
    return db.scalars(select(CommunityPost).where(CommunityPost.author_user_id==value).limit(min(max(limit,1),100))).all()
