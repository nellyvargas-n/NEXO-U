"""Fechas de inicio para no listar cursos con inscripción ya iniciada.

Revision ID: 20261122_04
Revises: 20261122_03
"""
from alembic import op
import sqlalchemy as sa

revision = "20261122_04"
down_revision = "20261122_03"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("courses", sa.Column("start_date", sa.Date(), nullable=True))


def downgrade():
    op.drop_column("courses", "start_date")
