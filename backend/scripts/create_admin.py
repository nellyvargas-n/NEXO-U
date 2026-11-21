"""Crear el primer admin localmente: python scripts/create_admin.py correo@ejemplo.com"""
import sys,getpass
from sqlalchemy import select
from app.core.database import SessionLocal
from app.core.auth_jwt import hash_password
from app.models.access import AppUser
if len(sys.argv)!=2:raise SystemExit('Uso: python scripts/create_admin.py correo@ejemplo.com')
email=sys.argv[1].strip().lower()
password=getpass.getpass('Contraseña admin (mínimo 10 caracteres): ')
if len(password)<10:raise SystemExit('Contraseña demasiado corta')
with SessionLocal() as db:
    if db.scalar(select(AppUser).where(AppUser.email==email)):raise SystemExit('El correo ya existe; no se eleva el rol automáticamente')
    db.add(AppUser(email=email,password_hash=hash_password(password),role='admin',active=True))
    db.commit()
print('Administrador creado')
