"""Catálogo de cursos de organizaciones verificadas."""
from datetime import date
from sqlalchemy import select, or_
from app.models.access import Organization
from app.models.entities import Course
from app.models.extended import OrganizationCourse
from app.core.config import settings


def verified_courses(db, limit: int = 50) -> list[Course]:
    verified_ids = (select(OrganizationCourse.course_id).join(Organization,
        Organization.id == OrganizationCourse.organization_id).where(Organization.verified.is_(True)))
    return list(db.scalars(select(Course).where(
        or_(Course.source_name.is_not(None), Course.id.in_(verified_ids)),
        *([Course.is_demo.is_(False)] if settings.environment == "production" else []),
        or_(Course.start_date.is_(None), Course.start_date >= date.today()),
        or_(Course.end_date.is_(None), Course.end_date >= date.today())
    ).order_by(Course.end_date, Course.id).limit(min(max(1,limit),100))).all())
