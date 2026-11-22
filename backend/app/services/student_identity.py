"""Identidad educativa por CUENTA (universitaria o escolar).

La cuenta autenticada es la autoridad. ``student_id`` se conserva únicamente por
compatibilidad con filas históricas relacionadas a ``profiles``.
"""
from fastapi import HTTPException
from sqlalchemy import and_, or_
from app.models.access import StudentAccount
from app.models.entities import Profile, Credential, Enrollment
from app.models.extended import SchoolProfile


def get_student_context(db, user_id: int):
    account = db.get(StudentAccount, user_id)
    university = db.get(Profile, account.profile_id) if account and account.profile_id else None
    school = db.get(SchoolProfile, user_id)
    if university and school:
        raise HTTPException(409, "Cuenta con dos perfiles académicos: requiere revisión")
    if university:
        return "universitario", university
    if school:
        return "colegial", school
    raise HTTPException(404, "Primero registra un perfil universitario o escolar")


def owned_credentials_filter(user_id: int, profile_type: str, profile):
    personal = Credential.student_user_id == user_id
    if profile_type == "universitario":
        return or_(personal, and_(Credential.student_user_id.is_(None), Credential.student_id == profile.id))
    return personal


def owned_enrollments_filter(user_id: int, profile_type: str, profile):
    personal = Enrollment.student_user_id == user_id
    if profile_type == "universitario":
        return or_(personal, and_(Enrollment.student_user_id.is_(None), Enrollment.student_id == profile.id))
    return personal


def profile_fk(profile_type: str, profile):
    return profile.id if profile_type == "universitario" else None
