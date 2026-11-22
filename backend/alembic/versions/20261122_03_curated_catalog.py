"""Atribución de fuentes y cursos abiertos sin Organization ficticia.

Revision ID: 20261122_03
Revises: 20261122_02
"""
from alembic import op
import sqlalchemy as sa

revision = "20261122_03"
down_revision = "20261122_02"
branch_labels = None
depends_on = None


def upgrade():
    for table in ("opportunities", "courses"):
        op.add_column(table, sa.Column("source_name", sa.String(120), nullable=True))
        op.add_column(table, sa.Column("source_kind", sa.String(30), nullable=True))
        op.add_column(table, sa.Column("summary", sa.Text(), nullable=True))
        op.add_column(table, sa.Column("source_url", sa.String(500), nullable=True))
        op.add_column(table, sa.Column("source_checked_on", sa.Date(), nullable=True))
        op.create_index(
            f"uq_{table}_curated_source_title", table, ["source_name", "title"],
            unique=True, postgresql_where=sa.text("source_name IS NOT NULL"),
        )
    op.add_column("courses", sa.Column("official_url", sa.String(500), nullable=True))
    op.alter_column("courses", "end_date", existing_type=sa.Date(), nullable=True)


def downgrade():
    op.alter_column("courses", "end_date", existing_type=sa.Date(), nullable=False)
    op.drop_column("courses", "official_url")
    for table in ("opportunities", "courses"):
        op.drop_index(f"uq_{table}_curated_source_title", table_name=table)
        op.drop_column(table, "source_checked_on")
        op.drop_column(table, "source_url")
        op.drop_column(table, "summary")
        op.drop_column(table, "source_kind")
        op.drop_column(table, "source_name")
