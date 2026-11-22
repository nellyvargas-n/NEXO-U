"""Crea una institución ficticia y una pasantía con cursos que cubren sus requisitos.

Uso solo en desarrollo:
ALLOW_DEMO_SEED=true python -m scripts.seed_demo_developer_institution

El usuario propietario se crea inactivo, sin contraseña conocida ni acceso.
"""
from datetime import date, timedelta
import os
import secrets

from sqlalchemy import select

from app.core.auth_jwt import hash_password
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.access import AppUser, Organization
from app.models.entities import Course, Opportunity, Requirement
from app.models.extended import OrganizationCourse, OrganizationOpportunity

SOURCE = "Instituto Tecnológico NEXO-U — DEMO"
OWNER_EMAIL = "instituto.demo@nexou.invalid"
OPPORTUNITY_TITLE = "Pasantía de Desarrollo Backend y Frontend — DEMO"
REQUIREMENTS = [
    ("skill", "has", "Spring Boot"),
    ("skill", "has", "Angular"),
    ("skill", "has", "PostgreSQL"),
    ("skill", "has", "Linux"),
]
COURSES = [
    {
        "title": "Spring Boot: APIs REST para la pasantía — DEMO",
        "skill": "Spring Boot",
        "duration_hours": 24,
        "cost_bob": 320,
        "summary": "Curso ficticio y asincrónico del Instituto Tecnológico NEXO-U — DEMO. Duración estimada: 24 horas. Acceso continuo, sin fechas fijas.",
    },
    {
        "title": "Angular: aplicaciones web y componentes — DEMO",
        "skill": "Angular",
        "duration_hours": 20,
        "cost_bob": 280,
        "summary": "Curso ficticio y asincrónico del Instituto Tecnológico NEXO-U — DEMO. Duración estimada: 20 horas. Acceso continuo, sin fechas fijas.",
    },
    {
        "title": "PostgreSQL: consultas y modelado relacional — DEMO",
        "skill": "PostgreSQL",
        "duration_hours": 16,
        "cost_bob": 220,
        "summary": "Curso ficticio y asincrónico del Instituto Tecnológico NEXO-U — DEMO. Duración estimada: 16 horas. Acceso continuo, sin fechas fijas.",
    },
    {
        "title": "Linux: terminal y fundamentos de servidores — DEMO",
        "skill": "Linux",
        "duration_hours": 12,
        "cost_bob": 180,
        "summary": "Curso ficticio y asincrónico del Instituto Tecnológico NEXO-U — DEMO. Duración estimada: 12 horas. Acceso continuo, sin fechas fijas.",
    },
]


def get_or_create_opportunity(db, organization):
    opportunity = db.scalar(select(Opportunity).where(
        Opportunity.source_name == SOURCE,
        Opportunity.title == OPPORTUNITY_TITLE,
    ))
    fields = {
        "category": "pasantia",
        "deadline": date.today() + timedelta(days=60),
        "official_url": "",
        "amount_bob": 0,
        "is_demo": True,
        "source_name": SOURCE,
        "source_kind": "demostracion",
        "summary": (
            "Convocatoria ficticia para probar el matching de NEXO-U; no es una vacante real. "
            "Requiere Spring Boot, Angular, PostgreSQL y Linux. Los cursos de la misma institución "
            "cubren cada requisito; empresa, condiciones y postulación reales están por definir."
        ),
        "source_url": None,
        "source_checked_on": None,
    }
    if opportunity is None:
        opportunity = Opportunity(title=OPPORTUNITY_TITLE, **fields)
        db.add(opportunity)
        db.flush()
    else:
        for key, value in fields.items():
            setattr(opportunity, key, value)

    existing = db.scalars(select(Requirement).where(
        Requirement.opportunity_id == opportunity.id,
    )).all()
    wanted = set(REQUIREMENTS)
    found = {(row.kind, row.operator, row.value) for row in existing}
    for row in existing:
        if (row.kind, row.operator, row.value) not in wanted:
            db.delete(row)
    for kind, operator, value in REQUIREMENTS:
        if (kind, operator, value) not in found:
            db.add(Requirement(
                opportunity_id=opportunity.id,
                kind=kind,
                operator=operator,
                value=value,
                mandatory=True,
            ))
    if db.get(OrganizationOpportunity, (organization.id, opportunity.id)) is None:
        db.add(OrganizationOpportunity(organization_id=organization.id, opportunity_id=opportunity.id))
    return opportunity


def get_or_create_courses(db, organization):
    rows = []
    for spec in COURSES:
        course = db.scalar(select(Course).where(
            Course.source_name == SOURCE,
            Course.title == spec["title"],
        ))
        fields = {
            "start_date": None,
            "end_date": None,
            "duration_hours": spec["duration_hours"],
            "delivery_mode": "asincrono",
            "is_demo": True,
            "cost_bob": spec["cost_bob"],
            "credential_kind": "skill",
            "credential_value": spec["skill"],
            "credential_level": None,
            "issuer": SOURCE,
            "source_name": SOURCE,
            "source_kind": "demostracion",
            "summary": spec["summary"],
            "official_url": None,
            "source_url": None,
            "source_checked_on": None,
        }
        if course is None:
            course = Course(title=spec["title"], **fields)
            db.add(course)
            db.flush()
        else:
            for key, value in fields.items():
                setattr(course, key, value)
        if db.get(OrganizationCourse, (organization.id, course.id)) is None:
            db.add(OrganizationCourse(organization_id=organization.id, course_id=course.id))
        rows.append(course)
    return rows


def main():
    if os.getenv("ALLOW_DEMO_SEED", "").lower() != "true":
        raise SystemExit("BLOQUEADO: ejecuta con ALLOW_DEMO_SEED=true solo en desarrollo")
    if settings.environment == "production":
        raise SystemExit("BLOQUEADO: no se crean instituciones de demostración en producción")

    with SessionLocal() as db:
        try:
            owner = db.scalar(select(AppUser).where(AppUser.email == OWNER_EMAIL))
            if owner is None:
                owner = AppUser(
                    email=OWNER_EMAIL,
                    role="empresa",
                    active=False,
                    password_hash=hash_password(secrets.token_urlsafe(32)),
                )
                db.add(owner)
                db.flush()
            elif owner.role != "empresa":
                raise SystemExit("CONFLICTO: la cuenta reservada para la institución tiene otro rol")

            organization = db.scalar(select(Organization).where(
                Organization.owner_user_id == owner.id,
                Organization.name == SOURCE,
            ))
            if organization is None:
                organization = Organization(owner_user_id=owner.id, name=SOURCE, verified=False)
                db.add(organization)
                db.flush()
            elif organization.verified:
                raise SystemExit("CONFLICTO: la institución demo no debe figurar como verificada")

            opportunity = get_or_create_opportunity(db, organization)
            courses = get_or_create_courses(db, organization)
            db.commit()
        except Exception:
            db.rollback()
            raise

        print(
            f"Institución demo #{organization.id}; pasantía #{opportunity.id}; "
            f"{len(courses)} cursos asincrónicos vinculados."
        )
        for course in courses:
            print(f"- {course.credential_value}: {course.cost_bob:.0f} Bs, {course.duration_hours} h")


if __name__ == "__main__":
    main()
