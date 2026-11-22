"""Comprobación de propiedad de cursos antes de validar una credencial."""
from sqlalchemy import select
from app.models.access import Organization
from app.models.extended import OrganizationCourse


def may_validate_course(db, company_user_id: int, course_id: int) -> bool:
    return db.scalar(select(OrganizationCourse.course_id).join(Organization,
        Organization.id == OrganizationCourse.organization_id).where(
        OrganizationCourse.course_id == course_id,
        Organization.owner_user_id == company_user_id,
        Organization.verified.is_(True))) is not None
