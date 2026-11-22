"""Elegibilidad determinista para perfiles universitarios y escolares.

El evaluador devuelve siempre ``operator``; para idiomas ese operador es el
nivel mínimo (por ejemplo B1). Nunca adjudica una beca automáticamente.
"""
from datetime import date
from decimal import Decimal, InvalidOperation
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.models.entities import Profile, Credential, Opportunity, Requirement, Course
from app.models.extended import SchoolProfile
from app.services.student_identity import get_student_context, owned_credentials_filter
from app.core.config import settings

LEVELS = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}


def matches_requirement(req, profile, credentials):
    """True/False según evidencia o None si el tipo de perfil no tiene ese dato."""
    kind, operator, value = req.kind, req.operator, req.value
    if kind == "career":
        if not isinstance(profile, Profile): return None
        return profile.career.casefold() in [v.strip().casefold() for v in value.split("|")]
    if kind == "semester":
        if not isinstance(profile, Profile): return None
        try: return profile.semester >= int(value)
        except (ValueError, TypeError): return False
    if kind == "age":
        if not isinstance(profile, Profile): return None
        try:
            low, high = map(int, value.split("-"))
            return low <= profile.age <= high
        except (ValueError, TypeError): return False
    if kind == "city":
        return profile.city.casefold() in [v.strip().casefold() for v in value.split("|")]
    if kind in ("average_grade", "math_grade", "graduation_year"):
        if not isinstance(profile, SchoolProfile): return None
        try:
            actual = Decimal(str(getattr(profile, kind)))
            required = Decimal(value)
            return actual >= required if operator == ">=" else actual == required if operator == "eq" else None
        except (InvalidOperation, ValueError, TypeError): return False
    if kind in ("skill", "language", "certificate"):
        for credential in credentials:
            if credential.kind != kind or credential.value.casefold() != value.casefold(): continue
            if kind != "language": return True
            required_level = LEVELS.get(operator.upper(), 99)
            if LEVELS.get((credential.level or "").upper(), 0) >= required_level: return True
        return False
    return None


def recommended_courses(req, courses, deadline):
    if req.kind not in ("skill", "language", "certificate") or deadline < date.today(): return []
    matches = []
    for course in courses:
        if course.start_date is not None and not date.today() <= course.start_date <= deadline: continue
        if course.end_date is not None and (course.end_date < date.today() or course.end_date > deadline): continue
        if course.credential_kind != req.kind or course.credential_value.casefold() != req.value.casefold(): continue
        if req.kind == "language" and LEVELS.get((course.credential_level or "").upper(), 0) < LEVELS.get(req.operator.upper(), 99): continue
        matches.append({"id": course.id, "title": course.title, "ends_on": course.end_date.isoformat() if course.end_date else None,
                        "cost_bob": course.cost_bob, "credential_level": course.credential_level,
                        "duration_hours": course.duration_hours, "delivery_mode": course.delivery_mode})
    return sorted(matches, key=lambda c: (c["cost_bob"], c["ends_on"] or "9999-12-31"))


def evaluate(db: Session, student_id: int | None = 1, student_user_id: int | None = None):
    """Cuenta tiene prioridad; student_id=1 solo permite el antiguo escenario demo."""
    if student_user_id is not None:
        profile_type, profile = get_student_context(db, student_user_id)
        filter_ = owned_credentials_filter(student_user_id, profile_type, profile)
        credentials = db.scalars(select(Credential).where(filter_)).all()
    else:
        profile = db.get(Profile, student_id) if student_id is not None else None
        if not profile: return []
        profile_type = "universitario"
        credentials = db.scalars(select(Credential).where(Credential.student_id == student_id)).all()

    if settings.demo_mode:
        opportunities = db.scalars(select(Opportunity).where(Opportunity.deadline >= date.today())).all()
        courses = db.scalars(select(Course).where(
            *([Course.is_demo.is_(False)] if settings.environment == "production" else []),
            or_(Course.start_date.is_(None), Course.start_date >= date.today()),
            or_(Course.end_date.is_(None), Course.end_date >= date.today()))).all()
    else:
        from app.models.access import Organization
        from app.models.extended import OrganizationCourse, OrganizationOpportunity
        verified_opportunities = (select(OrganizationOpportunity.opportunity_id)
            .join(Organization, Organization.id == OrganizationOpportunity.organization_id)
            .where(Organization.verified.is_(True)))
        opportunities = db.scalars(
            select(Opportunity).where(Opportunity.deadline >= date.today(),
                   or_(Opportunity.source_name.is_not(None), Opportunity.id.in_(verified_opportunities)),
                   *([Opportunity.is_demo.is_(False)] if settings.environment == "production" else []))
        ).all()
        verified_courses = (select(OrganizationCourse.course_id)
            .join(Organization, Organization.id == OrganizationCourse.organization_id)
            .where(Organization.verified.is_(True)))
        courses = db.scalars(
            select(Course).where(or_(Course.source_name.is_not(None), Course.id.in_(verified_courses)),
                *([Course.is_demo.is_(False)] if settings.environment == "production" else []),
                or_(Course.start_date.is_(None), Course.start_date >= date.today()),
                or_(Course.end_date.is_(None), Course.end_date >= date.today()))
        ).all()

    results = []
    for opportunity in opportunities:
        requirements = db.scalars(select(Requirement).where(Requirement.opportunity_id == opportunity.id,
                                                          Requirement.mandatory.is_(True))).all()
        if not requirements:
            results.append({"opportunity_id": opportunity.id, "title": opportunity.title,
                            "deadline": opportunity.deadline.isoformat(), "met": 0, "total": 0,
                            "percent": 0, "eligible": False, "profile_type": profile_type,
                            "is_demo": opportunity.is_demo, "requirements": []})
            continue
        checks = []
        for req in requirements:
            outcome = matches_requirement(req, profile, credentials)
            status = "cumple" if outcome is True else "falta" if outcome is False else "no_declarado"
            checks.append({"kind": req.kind, "operator": req.operator, "required": req.value,
                           "required_level": req.operator if req.kind == "language" else None,
                           "status": status, "courses": recommended_courses(req, courses, opportunity.deadline)
                           if outcome is False else []})
        met = sum(c["status"] == "cumple" for c in checks)
        results.append({"opportunity_id": opportunity.id, "title": opportunity.title,
                        "deadline": opportunity.deadline.isoformat(), "met": met, "total": len(checks),
                        "percent": round(met / len(checks) * 100), "eligible": met == len(checks),
                        "profile_type": profile_type, "is_demo": opportunity.is_demo,
                        "requirements": checks})
    return sorted(results, key=lambda r: (not r["eligible"], -r["percent"], r["deadline"]))
