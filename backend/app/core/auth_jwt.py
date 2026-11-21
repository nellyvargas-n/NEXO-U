from datetime import datetime, timedelta, timezone
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.access import AppUser

hasher=PasswordHasher()
bearer=HTTPBearer(auto_error=False)

def hash_password(password: str)->str:
    return hasher.hash(password)

def verify_password(password: str, hashed: str)->bool:
    try:return hasher.verify(hashed,password)
    except (VerifyMismatchError, VerificationError):return False

def issue_token(user:AppUser)->str:
    if len(settings.jwt_secret)<32:raise HTTPException(503,'Configura JWT_SECRET de al menos 32 caracteres')
    now=datetime.now(timezone.utc)
    return jwt.encode({'sub':str(user.id),'role':user.role,'iat':now,'exp':now+timedelta(minutes=settings.jwt_exp_minutes)},settings.jwt_secret,algorithm='HS256')

def current_user(credentials:HTTPAuthorizationCredentials|None=Depends(bearer),db:Session=Depends(get_db))->AppUser:
    if not credentials:raise HTTPException(401,'Token requerido',headers={'WWW-Authenticate':'Bearer'})
    if len(settings.jwt_secret)<32:raise HTTPException(503,'JWT_SECRET no configurado')
    try:
        payload=jwt.decode(credentials.credentials,settings.jwt_secret,algorithms=['HS256'],options={'require':['exp','sub']})
        uid=int(payload['sub'])
    except (jwt.PyJWTError,ValueError,KeyError):raise HTTPException(401,'Token inválido o vencido')
    user=db.get(AppUser,uid)
    if user is None or not user.active:raise HTTPException(401,'Cuenta no disponible')
    return user

def require_role(*roles):
    def check(user:AppUser=Depends(current_user)):
        if user.role not in roles:raise HTTPException(403,'Permiso insuficiente')
        return user
    return check
