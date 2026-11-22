"""Protecciones de identidad sin depender de memoria local de un contenedor.

Las comprobaciones ocurren por cuenta+IP. No guardar emails o IPs sin hashing.
La protección avanzada contra ataques distribuidos requiere también WAF/edge.
"""
import hashlib
import hmac
import secrets
import smtplib
import ssl
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from urllib.parse import quote
from fastapi import HTTPException
from sqlalchemy import delete, func, select
from app.core.config import settings
from app.models.auth_security import AuthAttempt


def utcnow(): return datetime.now(timezone.utc)


def key_hash(kind:str, ip:str, email:str='')->str:
    material=f'{kind}|{ip}|{email.strip().lower()}'
    return hmac.new(settings.jwt_secret.encode(),material.encode(),hashlib.sha256).hexdigest()


def throttle(db,key:str,max_attempts:int,window_minutes:int):
    cutoff=utcnow()-timedelta(minutes=window_minutes)
    attempts=db.scalar(select(func.count()).select_from(AuthAttempt).where(
        AuthAttempt.key_hash==key,AuthAttempt.created_at>=cutoff)) or 0
    if attempts>=max_attempts:
        raise HTTPException(429,'Demasiados intentos. Prueba más tarde.',headers={'Retry-After':str(window_minutes*60)})


def record_attempt(db,key:str):
    db.add(AuthAttempt(key_hash=key));db.commit()


def clear_attempts(db,key:str):
    db.execute(delete(AuthAttempt).where(AuthAttempt.key_hash==key));db.commit()


def digest_token(token:str)->str:
    return hashlib.sha256(token.encode()).hexdigest()


def generate_reset_token()->str:
    return secrets.token_urlsafe(48)


def send_password_reset(email:str,token:str):
    if not settings.smtp_host or not settings.smtp_from:
        raise RuntimeError('El envío SMTP no está configurado')
    message=EmailMessage()
    message['Subject']='NEXO U: restablecer tu contraseña'
    message['From']=settings.smtp_from
    message['To']=email
    url=settings.public_frontend_url.rstrip('/')+'/reset?token='+quote(token,safe='')
    message.set_content('Solicitaste restablecer tu contraseña en NEXO U.\n'
                        f'Abre este enlace (válido por 30 minutos): {url}\n'
                        'Si no lo solicitaste, ignora este mensaje.')
    with smtplib.SMTP(settings.smtp_host,settings.smtp_port,timeout=10) as smtp:
        if settings.smtp_starttls:smtp.starttls(context=ssl.create_default_context())
        if settings.smtp_username:
            smtp.login(settings.smtp_username,settings.smtp_password)
        smtp.send_message(message)
