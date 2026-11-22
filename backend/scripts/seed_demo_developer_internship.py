"""Crea una sola pasantía ficticia para probar compatibilidad de habilidades.

Uso solo en desarrollo: ALLOW_DEMO_SEED=true python -m scripts.seed_demo_developer_internship
No crea usuarios, organizaciones ni modifica perfiles de estudiantes.
"""
from datetime import date, timedelta
import os

from sqlalchemy import or_, select

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.entities import Opportunity, Requirement

SOURCE = "NEXO-U · Desarrollo profesional"
LEGACY_SOURCE = "NEXO-U · demo de matching"
TITLE = "Pasantía de Desarrollo de Software"
LEGACY_TITLE = "Pasantía de Desarrollo de Software — DEMO"
REQUIREMENTS = [
    ("skill", "has", "Python"),
    ("skill", "has", "Java"),
    ("skill", "has", "React"),
    ("language", "B2", "Inglés"),
]


def main():
    if os.getenv("ALLOW_DEMO_SEED", "").lower() != "true":
        raise SystemExit("BLOQUEADO: ejecuta con ALLOW_DEMO_SEED=true solo en desarrollo")
    if settings.environment == "production":
        raise SystemExit("BLOQUEADO: no se crean ofertas de demostración en producción")

    with SessionLocal() as db:
        try:
            opportunity = db.scalar(select(Opportunity).where(
                or_(Opportunity.source_name.in_([SOURCE, LEGACY_SOURCE]),
                    Opportunity.title.in_([TITLE, LEGACY_TITLE])),
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
                    "Pasantía de desarrollo de software con requisitos en Python, Java, React e inglés B2. "
                    "Revisa las condiciones de la convocatoria y fortalece cada requisito desde tu perfil."
                ),
                "source_url": None,
                "source_checked_on": None,
            }
            if opportunity is None:
                opportunity = Opportunity(title=TITLE, **fields)
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
            db.commit()
        except Exception:
            db.rollback()
            raise
        print(f"Oportunidad #{opportunity.id} lista; requisitos: Python, Java, React e inglés B2.")


if __name__ == "__main__":
    main()
