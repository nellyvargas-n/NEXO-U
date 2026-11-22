from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth_jwt import hash_password,verify_password,issue_token,current_user,require_role
from app.models.access import AppUser,Organization,StudentAccount,AuditLog
from app.models.auth_security import PasswordResetToken
from app.core.config import settings
from app.core import auth_safety
from datetime import timedelta, timezone
from sqlalchemy.exc import SQLAlchemyError

router=APIRouter(tags=['Autenticación y 3 roles'])
class Register(BaseModel):
    email:EmailStr
    password:str=Field(min_length=10,max_length=128)
    role:str=Field(pattern='^(usuario|empresa)$')
class Login(BaseModel):
    email:EmailStr
    password:str
class RequestPasswordReset(BaseModel):
    email:EmailStr
class ConfirmPasswordReset(BaseModel):
    token: str = Field(min_length=30,max_length=180)
    new_password: str = Field(min_length=12,max_length=128)
class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=12,max_length=128)

class NewOrganization(BaseModel):
    name:str=Field(min_length=2,max_length=150)
class Status(BaseModel):
    verified:bool
class AdminChange(BaseModel):
    active:bool

def public_user(u):return {'id':u.id,'email':u.email,'role':u.role,'active':u.active}

@router.post('/auth/register',status_code=201)
def register(body:Register,request:Request,db:Session=Depends(get_db)):
    limit_key=auth_safety.key_hash('register',request.client.host if request.client else 'unknown')
    auth_safety.throttle(db,limit_key,100,15)
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
    auth_safety.record_attempt(db,limit_key)
    return public_user(u)

@router.post('/auth/login')
def login(body:Login,request:Request,db:Session=Depends(get_db)):
    email=str(body.email).strip().lower()
    attempt_key=auth_safety.key_hash('login',request.client.host if request.client else 'unknown',email)
    auth_safety.throttle(db,attempt_key,5,5)
    u=db.scalar(select(AppUser).where(AppUser.email==email))
    if not u or not u.active or not verify_password(body.password,u.password_hash):
        auth_safety.record_attempt(db,attempt_key)
        raise HTTPException(401,'Credenciales inválidas')
    auth_safety.clear_attempts(db,attempt_key)
    return {'access_token':issue_token(u),'token_type':'bearer','role':u.role}

@router.get('/auth/me')
def me(u:AppUser=Depends(current_user)):return public_user(u)

@router.post('/auth/cambiar-clave')
def change_password(body:PasswordChange,u:AppUser=Depends(current_user),db:Session=Depends(get_db)):
    if not verify_password(body.current_password,u.password_hash):
        raise HTTPException(400,'Contraseña actual incorrecta')
    if body.new_password == body.current_password:
        raise HTTPException(422,'La nueva contraseña debe ser diferente')
    u.password_hash=hash_password(body.new_password)
    u.token_version=(u.token_version or 0)+1
    db.add(AuditLog(actor_user_id=u.id,action='change_password',target_type='app_users',target_id=str(u.id)))
    db.commit()
    return {'changed':True,'message':'Sesiones anteriores revocadas. Vuelve a iniciar sesión.'}

@router.post('/auth/recuperar-clave/solicitar',status_code=202)
def request_password_reset(body:RequestPasswordReset,request:Request,db:Session=Depends(get_db)):
    if not settings.smtp_host or not settings.smtp_from:
        raise HTTPException(503,'Recuperación por correo no habilitada: configura SMTP en el servidor')
    email=str(body.email).strip().lower()
    key=auth_safety.key_hash('reset',request.client.host if request.client else 'unknown',email)
    auth_safety.throttle(db,key,3,15)
    auth_safety.record_attempt(db,key)
    # Respuesta idéntica para cuentas existentes e inexistentes.
    answer={'message':'Si existe la cuenta, enviaremos instrucciones al correo registrado.'}
    user=db.scalar(select(AppUser).where(AppUser.email==email,AppUser.active.is_(True)))
    if user is None:return answer
    raw=auth_safety.generate_reset_token()
    record=PasswordResetToken(user_id=user.id,token_hash=auth_safety.digest_token(raw),
          expires_at=auth_safety.utcnow()+timedelta(minutes=30))
    db.add(record); db.flush()
    try:
        auth_safety.send_password_reset(email,raw)
    except Exception:
        # Nunca revelar la existencia de la cuenta ni registrar tokens o contraseñas.
        db.rollback()
        return answer
    db.commit()
    return answer

@router.post('/auth/recuperar-clave/confirmar')
def confirm_password_reset(body:ConfirmPasswordReset,db:Session=Depends(get_db)):
    token_hash=auth_safety.digest_token(body.token)
    row=db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash==token_hash).with_for_update())
    if not row or row.used_at is not None:
        raise HTTPException(400,'Enlace inválido o utilizado')
    expires=row.expires_at
    if expires.tzinfo is None:expires=expires.replace(tzinfo=timezone.utc)
    if expires<=auth_safety.utcnow():raise HTTPException(400,'Enlace vencido')
    user=db.get(AppUser,row.user_id)
    if not user or not user.active:raise HTTPException(400,'Enlace inválido')
    if verify_password(body.new_password,user.password_hash):
        raise HTTPException(422,'Debes elegir una contraseña diferente')
    user.password_hash=hash_password(body.new_password)
    user.token_version=(user.token_version or 0)+1
    row.used_at=auth_safety.utcnow()
    db.add(AuditLog(actor_user_id=user.id,action='password_reset',target_type='app_users',target_id=str(user.id)))
    db.commit()
    return {'changed':True,'message':'Contraseña restablecida. Inicia sesión nuevamente.'}

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
