"""Repara la carga del catálogo en bases que ya marcaron la revisión _07.

Revision ID: 20261122_08
Revises: 20261122_07
"""
from pathlib import Path
import runpy

from alembic import op
import sqlalchemy as sa

revision = "20261122_08"
down_revision = "20261122_07"
branch_labels = None
depends_on = None


def upgrade():
    # Algunas bases quedaron en _07 por la colisión de dos revisiones con el mismo ID.
    # Reaplicar el catálogo completo aquí es seguro: cada fila se identifica por fuente y título.
    op.alter_column("opportunities", "deadline", existing_type=sa.Date(), nullable=True)
    catalog = runpy.run_path(str(Path(__file__).with_name("20261122_07_catalog_and_school_scholarships.py")))
    bind = op.get_bind()
    opportunity, course, requirement, band = catalog["_tables"]()

    for item in catalog["OPPORTUNITIES"] + catalog["PROGRAMS"] + [catalog["DEMO"]]:
        catalog["_upsert_opportunity"](bind, opportunity, requirement, band, item)

    for item in catalog["COURSES"]:
        values = dict(item)
        course_id = bind.execute(sa.select(course.c.id).where(
            course.c.source_name == values["source_name"],
            course.c.title == values["title"],
        )).scalar_one_or_none()
        if course_id is None:
            bind.execute(course.insert().values(**values))
        else:
            bind.execute(course.update().where(course.c.id == course_id).values(**values))


def downgrade():
    # Revision _07 owns this same idempotent catalog; keep it when removing the backfill.
    pass
