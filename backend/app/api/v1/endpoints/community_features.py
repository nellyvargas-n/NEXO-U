"""Comunidad, comentarios, eventos públicos, avisos privados y moderación."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth_jwt import current_user, require_role
from app.core.database import get_db
from app.models.access import AppUser, Organization, AuditLog
from app.models.extended import CommunityPost, CommunityComment, CommunityEvent, Notification

router=APIRouter(tags=['Comunidad y notificaciones'])

class PostIn(BaseModel):
    title:str=Field(min_length=3,max_length=150)
    body:str=Field(min_length=3,max_length=2500)

@router.post('/comunidad/publicaciones',status_code=201)
def create_post(body:PostIn,u:AppUser=Depends(current_user),db:Session=Depends(get_db)):
    row=CommunityPost(author_user_id=u.id,**body.model_dump());db.add(row);db.commit();db.refresh(row)
    return {'id':row.id,'title':row.title,'visible':row.visible}

@router.get('/comunidad/publicaciones')
def list_posts(limit:int=Query(default=30,ge=1,le=100),offset:int=Query(default=0,ge=0),db:Session=Depends(get_db)):
    q=select(CommunityPost).where(CommunityPost.visible.is_(True)).order_by(CommunityPost.id.desc()).offset(offset).limit(limit)
    return [{'id':p.id,'title':p.title,'body':p.body,'author_user_id':p.author_user_id,'created_at':p.created_at} for p in db.scalars(q).all()]

@router.delete('/comunidad/publicaciones/{post_id}')
def remove_post(post_id:int,u:AppUser=Depends(current_user),db:Session=Depends(get_db)):
    p=db.get(CommunityPost,post_id)
    if not p or not p.visible:raise HTTPException(404,'Publicación no encontrada')
    if p.author_user_id!=u.id and u.role!='admin':raise HTTPException(403,'No tienes permiso')
    p.visible=False
    db.add(AuditLog(actor_user_id=u.id,action='hide_post',target_type='community_posts',target_id=str(p.id)))
    db.commit();return {'hidden':True}

class CommentIn(BaseModel):
    body:str=Field(min_length=2,max_length=1200)

@router.post('/comunidad/publicaciones/{post_id}/comentarios',status_code=201)
def add_comment(post_id:int,body:CommentIn,u:AppUser=Depends(current_user),db:Session=Depends(get_db)):
    p=db.get(CommunityPost,post_id)
    if not p or not p.visible:raise HTTPException(404,'Publicación no encontrada')
    c=CommunityComment(post_id=post_id,author_user_id=u.id,body=body.body)
    db.add(c);db.commit();db.refresh(c);return {'id':c.id,'post_id':post_id,'body':c.body}

@router.get('/comunidad/publicaciones/{post_id}/comentarios')
def get_comments(post_id:int,db:Session=Depends(get_db)):
    p=db.get(CommunityPost,post_id)
    if not p or not p.visible:raise HTTPException(404,'Publicación no encontrada')
    return [{'id':c.id,'body':c.body,'author_user_id':c.author_user_id,'created_at':c.created_at} for c in db.scalars(select(CommunityComment).where(CommunityComment.post_id==post_id,CommunityComment.visible.is_(True)).order_by(CommunityComment.id)).all()]

@router.delete('/comunidad/comentarios/{comment_id}')
def remove_comment(comment_id:int,u:AppUser=Depends(current_user),db:Session=Depends(get_db)):
    c=db.get(CommunityComment,comment_id)
    if not c or not c.visible:raise HTTPException(404,'Comentario inexistente')
    if c.author_user_id!=u.id and u.role!='admin':raise HTTPException(403,'No tienes permiso')
    c.visible=False;db.commit();return {'hidden':True}

class EventIn(BaseModel):
    organization_id:int=Field(gt=0)
    title:str=Field(min_length=3,max_length=150)
    description:str=Field(min_length=3,max_length=2500)
    starts_at:datetime
    public_url:HttpUrl|None=None

@router.post('/empresa/eventos',status_code=201)
def create_event(body:EventIn,u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    org=db.get(Organization,body.organization_id)
    if not org or org.owner_user_id!=u.id:raise HTTPException(404,'Organización inexistente o ajena')
    if not org.verified:raise HTTPException(403,'Organización no verificada')
    e=CommunityEvent(organization_id=org.id,title=body.title,description=body.description,starts_at=body.starts_at,public_url=str(body.public_url) if body.public_url else None,published=True)
    db.add(e);db.commit();db.refresh(e);return {'id':e.id,'published':True}

@router.get('/eventos')
def public_events(limit:int=Query(default=30,ge=1,le=100),db:Session=Depends(get_db)):
    q=select(CommunityEvent,Organization).join(Organization,Organization.id==CommunityEvent.organization_id).where(CommunityEvent.published.is_(True),Organization.verified.is_(True)).order_by(CommunityEvent.starts_at).limit(limit)
    return [{'id':e.id,'title':e.title,'description':e.description,'starts_at':e.starts_at,'public_url':e.public_url,'organization':org.name} for e,org in db.execute(q)]

@router.delete('/empresa/eventos/{event_id}')
def cancel_event(event_id:int,u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    e=db.get(CommunityEvent,event_id)
    if not e:raise HTTPException(404,'Evento inexistente')
    org=db.get(Organization,e.organization_id)
    if not org or org.owner_user_id!=u.id:raise HTTPException(403,'Evento ajeno')
    e.published=False;db.commit();return {'unpublished':True}

@router.get('/notificaciones')
def my_notifications(u:AppUser=Depends(current_user),db:Session=Depends(get_db)):
    return [{'id':n.id,'title':n.title,'message':n.message,'read':n.read,'created_at':n.created_at} for n in db.scalars(select(Notification).where(Notification.user_id==u.id).order_by(Notification.id.desc()).limit(100)).all()]

@router.patch('/notificaciones/{notification_id}/leer')
def mark_read(notification_id:int,u:AppUser=Depends(current_user),db:Session=Depends(get_db)):
    n=db.get(Notification,notification_id)
    if not n or n.user_id!=u.id:raise HTTPException(404,'Notificación no encontrada')
    n.read=True;db.commit();return {'id':n.id,'read':True}
