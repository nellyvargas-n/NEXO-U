"""Acceso a perfiles académicos sin consultar datos de otras cuentas."""
from app.services.student_identity import get_student_context
from app.models.entities import Profile


def student_summary(db, user_id: int) -> dict:
    kind, profile = get_student_context(db, user_id)
    return {'profile_type': kind, 'name': profile.name if isinstance(profile, Profile) else profile.full_name,
            'city': profile.city}
