"""Crea una sola pasantía ficticia para probar compatibilidad de habilidades.

Uso solo en desarrollo: ALLOW_DEMO_SEED=true python -m scripts.seed_demo_developer_internship
No crea usuarios, organizaciones ni modifica perfiles de estudiantes.
"""
from datetime import date, timedelta
import os

from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.entities import Opportunity, Requirement

SOURCE = "NEXO-U · demo de matching"
TITLE = "Pasantía de Desarrollo de Software — DEMO"
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
                Opportunity.source_name == SOURCE,
                Opportunity.title == TITLE,
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
                    "Oferta ficticia para probar el matching de perfiles; no corresponde a una vacante real. "
                    "Compara tres habilidades técnicas (Python, Java y React) e inglés B2. "
                    "La fecha de cierre se muestra únicamente para la prueba; empresa, ubicación, modalidad, "
                    "remuneración y postulación están por definir."
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
        print(f"Oferta demo #{opportunity.id} lista; requisitos: Python, Java, React e inglés B2.")


if __name__ == "__main__":
    main()
