"""Contrato compacto para React/Vite; los datos privados se filtran por JWT y rol."""
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.auth_jwt import require_role
from app.core.database import get_db
from app.models.access import AppUser, Organization, StudentAccount
from app.models.entities import Profile, Credential, Opportunity, Course
from app.models.extended import SchoolProfile, Notification, OrganizationOpportunity, OrganizationCourse
from app.services.matching_service import evaluate
from app.services.student_identity import get_student_context, owned_credentials_filter

router = APIRouter(tags=["Paneles para frontend React"])

@router.get("/meta")
def meta():
    """Datos públicos necesarios para integrar React; no devuelve secretos."""
    return {
        "name": "NEXO U", "api_version": "1.3.0", "api_prefix": "/api/v1",
        "roles": ["usuario", "empresa", "admin"],
        "auth": {"register": "/api/v1/auth/register", "login": "/api/v1/auth/login",
                 "current_user": "/api/v1/auth/me", "scheme": "Bearer JWT"},
        "docs": "/docs", "health": "/health", "ready": "/ready"
    }

@router.get("/usuario/dashboard")
def student_dashboard(user: AppUser = Depends(require_role("usuario")), db: Session = Depends(get_db)):
    account = db.get(StudentAccount, user.id)
    p = db.get(Profile, account.profile_id) if account and account.profile_id else None
    school = db.get(SchoolProfile, user.id)
    context = get_student_context(db,user.id) if (p or school) else None
    matching = evaluate(db,student_user_id=user.id) if context else []
    credential_count = (db.scalar(select(func.count()).select_from(Credential).where(
        owned_credentials_filter(user.id,*context))) or 0) if context else 0
    notifications_unread = db.scalar(select(func.count()).select_from(Notification).where(Notification.user_id == user.id, Notification.read.is_(False))) or 0
    return {
        "role": "usuario", "account_id": user.id,
        "profile_type": "universitario" if p else "colegial" if school else "pendiente",
        "profile": {"id": p.id, "name": p.name, "career": p.career, "semester": p.semester, "age": p.age, "city": p.city} if p else None,
        "school_profile": {"full_name": school.full_name, "graduation_year": school.graduation_year} if school else None,
        "credential_count": credential_count,
        "matches": matching,
        "unread_notifications": notifications_unread,
        "finance": "Consultar /api/v1/usuario/finanzas/resumen solo para universitarios adultos"
    }

@router.get("/empresa/dashboard")
def company_dashboard(user: AppUser = Depends(require_role("empresa")), db: Session = Depends(get_db)):
    organizations = db.scalars(select(Organization).where(Organization.owner_user_id == user.id).order_by(Organization.id)).all()
    ids = [o.id for o in organizations]
    opp_count = db.scalar(select(func.count()).select_from(OrganizationOpportunity).where(OrganizationOpportunity.organization_id.in_(ids))) if ids else 0
    course_count = db.scalar(select(func.count()).select_from(OrganizationCourse).where(OrganizationCourse.organization_id.in_(ids))) if ids else 0
    return {"role": "empresa", "account_id": user.id,
            "organizations": [{"id": o.id, "name": o.name, "verified": o.verified} for o in organizations],
            "opportunity_count": opp_count or 0, "course_count": course_count or 0,
            "note": "No se exponen montos ni finanzas de los estudiantes"}

@router.get("/admin/dashboard")
def admin_dashboard(user: AppUser = Depends(require_role("admin")), db: Session = Depends(get_db)):
    return {"role": "admin",
            "users": db.scalar(select(func.count()).select_from(AppUser)) or 0,
            "organizations": db.scalar(select(func.count()).select_from(Organization)) or 0,
            "pending_verification": db.scalar(select(func.count()).select_from(Organization).where(Organization.verified.is_(False))) or 0,
            "opportunities": db.scalar(select(func.count()).select_from(Opportunity)) or 0,
            "courses": db.scalar(select(func.count()).select_from(Course)) or 0}
