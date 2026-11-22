"""Limpieza operativa manual de eventos de seguridad antiguos.

Ejecutar de forma planificada solo si el administrador de infraestructura lo desea:
python -m scripts.limpiar_intentos
No elimina cuentas ni datos de oportunidades.
"""
from datetime import timedelta
from sqlalchemy import delete
from app.core.database import SessionLocal
from app.models.auth_security import AuthAttempt, PasswordResetToken
from app.core.auth_safety import utcnow

with SessionLocal() as db:
    a=db.execute(delete(AuthAttempt).where(AuthAttempt.created_at < utcnow()-timedelta(days=7))).rowcount
    b=db.execute(delete(PasswordResetToken).where(PasswordResetToken.expires_at < utcnow()-timedelta(days=7))).rowcount
    db.commit()
print(f'Eventos antiguos limpiados: intentos {a}, enlaces vencidos {b}')
