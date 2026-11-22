"""Catálogo de cursos de organizaciones verificadas."""
from datetime import date
from sqlalchemy import select
from app.models.access import Organization
from app.models.entities import Course
from app.models.extended import OrganizationCourse


def verified_courses(db, limit: int = 50) -> list[Course]:
    return list(db.scalars(select(Course).join(OrganizationCourse,
        OrganizationCourse.course_id == Course.id).join(Organization,
        Organization.id == OrganizationCourse.organization_id).where(
        Organization.verified.is_(True), Course.end_date >= date.today()
    ).order_by(Course.end_date, Course.id).limit(min(max(1,limit),100))).all())
