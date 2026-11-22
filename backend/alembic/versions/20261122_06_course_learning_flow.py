"""Contenido de cursos y flujo de inscripción.

Revision ID: 20261122_06
Revises: 20261122_05
"""
from alembic import op
import sqlalchemy as sa

revision = "20261122_06"
down_revision = "20261122_05"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "course_lessons",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("course_id", sa.Integer(), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.UniqueConstraint("course_id", "position", name="uq_course_lesson_position"),
    )
    op.create_index("ix_course_lessons_course_id", "course_lessons", ["course_id"])
    op.create_table(
        "course_lesson_completions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_user_id", sa.BigInteger(), sa.ForeignKey("app_users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("course_id", sa.Integer(), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("student_user_id", "lesson_id", name="uq_student_lesson_completion"),
    )
    op.create_index("ix_course_lesson_completions_student_user_id", "course_lesson_completions", ["student_user_id"])
    op.create_index("ix_course_lesson_completions_course_id", "course_lesson_completions", ["course_id"])
    payment_id = sa.BigInteger().with_variant(sa.Integer(), "sqlite")
    op.create_table(
        "demo_course_payments",
        sa.Column("id", payment_id, primary_key=True, autoincrement=True),
        sa.Column("student_user_id", sa.BigInteger(), sa.ForeignKey("app_users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("course_id", sa.Integer(), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("amount_bob", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="pending"),
        sa.Column("proof_filename", sa.String(length=180), nullable=True),
        sa.Column("proof_content_type", sa.String(length=80), nullable=True),
        sa.Column("proof_data", sa.LargeBinary(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("student_user_id", "idempotency_key", name="uq_course_payment_idempotency"),
        sa.CheckConstraint("amount_bob >= 0", name="ck_demo_course_payment_amount"),
        sa.CheckConstraint("status IN ('pending', 'proof_uploaded', 'confirmed', 'cancelled')", name="ck_demo_course_payment_status"),
    )
    op.create_index("ix_demo_course_payments_student_user_id", "demo_course_payments", ["student_user_id"])
    op.create_index("ix_demo_course_payments_course_id", "demo_course_payments", ["course_id"])
    op.execute(sa.text("""
        UPDATE opportunities
        SET title = 'Beca por rendimiento escolar',
            source_name = 'NEXO-U · Becas privadas',
            summary = 'Criterios de referencia para becas de ingreso. Compara el promedio general y Matemáticas. La institución revisa los documentos y confirma la asignación final.'
        WHERE title = 'Beca por rendimiento escolar — DEMO'
          AND source_name = 'NEXO-U · demo de becas privadas'
    """))


def downgrade():
    op.execute(sa.text("""
        UPDATE opportunities
        SET title = 'Beca por rendimiento escolar — DEMO',
            source_name = 'NEXO-U · demo de becas privadas',
            summary = 'Escala ficticia para probar becas escolares. No es una oferta de una universidad real.'
        WHERE title = 'Beca por rendimiento escolar'
          AND source_name = 'NEXO-U · Becas privadas'
    """))
    op.drop_index("ix_demo_course_payments_course_id", table_name="demo_course_payments")
    op.drop_index("ix_demo_course_payments_student_user_id", table_name="demo_course_payments")
    op.drop_table("demo_course_payments")
    op.drop_index("ix_course_lesson_completions_course_id", table_name="course_lesson_completions")
    op.drop_index("ix_course_lesson_completions_student_user_id", table_name="course_lesson_completions")
    op.drop_table("course_lesson_completions")
    op.drop_index("ix_course_lessons_course_id", table_name="course_lessons")
    op.drop_table("course_lessons")
