"""Lista pública de oportunidades vigentes de emisores verificados."""
from datetime import date
from sqlalchemy import select
from app.models.access import Organization
from app.models.entities import Opportunity
from app.models.extended import OrganizationOpportunity


def published_opportunities(db, limit: int = 50) -> list[Opportunity]:
    return list(db.scalars(select(Opportunity).join(OrganizationOpportunity,
        OrganizationOpportunity.opportunity_id == Opportunity.id).join(Organization,
        Organization.id == OrganizationOpportunity.organization_id).where(
        Organization.verified.is_(True), Opportunity.deadline >= date.today()
    ).order_by(Opportunity.deadline, Opportunity.id).limit(min(max(1,limit),100))).all())
