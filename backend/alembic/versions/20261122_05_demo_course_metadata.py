"""Duración, modalidad e indicador demo para cursos.

Revision ID: 20261122_05
Revises: 20261122_04
"""
from alembic import op
import sqlalchemy as sa

revision = "20261122_05"
down_revision = "20261122_04"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("courses", sa.Column("duration_hours", sa.Integer(), nullable=True))
    op.add_column("courses", sa.Column(
        "delivery_mode", sa.String(length=20), nullable=False, server_default="asincrono",
    ))
    op.add_column("courses", sa.Column(
        "is_demo", sa.Boolean(), nullable=False, server_default=sa.false(),
    ))


def downgrade():
    op.drop_column("courses", "is_demo")
    op.drop_column("courses", "delivery_mode")
    op.drop_column("courses", "duration_hours")
