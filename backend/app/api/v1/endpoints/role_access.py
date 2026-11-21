from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth_jwt import hash_password,verify_password,issue_token,current_user,require_role
from app.models.access import AppUser,Organization,StudentAccount,AuditLog

router=APIRouter(tags=['Autenticación y 3 roles'])
class Register(BaseModel):
    email:EmailStr
    password:str=Field(min_length=10,max_length=128)
    role:str=Field(pattern='^(usuario|empresa)$')
class Login(BaseModel):
    email:EmailStr
    password:str
class NewOrganization(BaseModel):
    name:str=Field(min_length=2,max_length=150)
class Status(BaseModel):
    verified:bool
class AdminChange(BaseModel):
    active:bool

def public_user(u):return {'id':u.id,'email':u.email,'role':u.role,'active':u.active}

@router.post('/auth/register',status_code=201)
def register(body:Register,db:Session=Depends(get_db)):
    email=str(body.email).strip().lower()
    if db.scalar(select(AppUser.id).where(AppUser.email==email)) is not None:raise HTTPException(409,'Correo ya registrado')
    u=AppUser(email=email,password_hash=hash_password(body.password),role=body.role,active=True)
    db.add(u)
    try:
        db.flush()
        if u.role=='usuario':db.add(StudentAccount(user_id=u.id))
        db.commit()
    except IntegrityError:
        db.rollback();raise HTTPException(409,'Correo ya registrado')
    db.refresh(u)
    return public_user(u)

@router.post('/auth/login')
def login(body:Login,db:Session=Depends(get_db)):
    u=db.scalar(select(AppUser).where(AppUser.email==str(body.email).lower()))
    if not u or not u.active or not verify_password(body.password,u.password_hash):raise HTTPException(401,'Credenciales inválidas')
    return {'access_token':issue_token(u),'token_type':'bearer','role':u.role}

@router.get('/auth/me')
def me(u:AppUser=Depends(current_user)):return public_user(u)

@router.get('/usuario/panel')
def usuario(u:AppUser=Depends(require_role('usuario'))):return {'message':'Panel estudiante','user':public_user(u)}

@router.post('/empresa/organizaciones',status_code=201)
def create_org(body:NewOrganization,u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    org=Organization(owner_user_id=u.id,name=body.name,verified=False)
    db.add(org);db.commit();db.refresh(org)
    return {'id':org.id,'name':org.name,'verified':org.verified}

@router.get('/empresa/organizaciones')
def my_orgs(u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    return [{'id':o.id,'name':o.name,'verified':o.verified} for o in db.scalars(select(Organization).where(Organization.owner_user_id==u.id)).all()]

@router.get('/admin/usuarios')
def list_users(u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    return [public_user(x) for x in db.scalars(select(AppUser).order_by(AppUser.id).limit(100)).all()]

@router.patch('/admin/usuarios/{user_id}')
def change_user(user_id:int,body:AdminChange,u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    target=db.get(AppUser,user_id)
    if target is None:raise HTTPException(404,'Usuario no encontrado')
    if target.id==u.id and not body.active:raise HTTPException(400,'No puedes desactivar tu propia cuenta')
    target.active=body.active
    db.add(AuditLog(actor_user_id=u.id,action='user_status',target_type='app_users',target_id=str(user_id)))
    db.commit();return public_user(target)

@router.patch('/admin/organizaciones/{org_id}/verificacion')
def verify_org(org_id:int,body:Status,u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    org=db.get(Organization,org_id)
    if org is None:raise HTTPException(404,'Organización no encontrada')
    org.verified=body.verified
    db.add(AuditLog(actor_user_id=u.id,action='verify_organization',target_type='organizations',target_id=str(org_id)))
    db.commit();return {'id':org.id,'verified':org.verified}
