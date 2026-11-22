"""Consultas de credenciales aplicando siempre la propiedad de cuenta."""
from sqlalchemy import select
from app.services.student_identity import get_student_context, owned_credentials_filter
from app.models.entities import Credential


def list_student_credentials(db, user_id: int) -> list[Credential]:
    kind, profile = get_student_context(db, user_id)
    return list(db.scalars(select(Credential).where(owned_credentials_filter(user_id, kind, profile))).all())
