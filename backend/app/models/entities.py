from datetime import date, datetime, timezone
from sqlalchemy import (String, Integer, BigInteger, Float, Boolean, ForeignKey, Date, DateTime,
                        LargeBinary, Text, UniqueConstraint, CheckConstraint)
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    career: Mapped[str] = mapped_column(String(120))
    semester: Mapped[int]
    age: Mapped[int]
    city: Mapped[str] = mapped_column(String(120), default="La Paz")

class Credential(Base):
    __tablename__ = "credentials"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int | None] = mapped_column(ForeignKey("profiles.id"), nullable=True)
    student_user_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("app_users.id", ondelete="CASCADE"), nullable=True, index=True)
    kind: Mapped[str] = mapped_column(String(30))
    value: Mapped[str] = mapped_column(String(120))
    level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    issuer: Mapped[str | None] = mapped_column(String(120), nullable=True)

class Opportunity(Base):
    __tablename__ = "opportunities"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50))
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    official_url: Mapped[str] = mapped_column(String(500))
    amount_bob: Mapped[float] = mapped_column(Float, default=0)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Las convocatorias recopiladas no se asocian a una Organization ni se presentan
    # como verificadas en NEXO-U; conservan la atribución y la fuente consultada.
    source_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    source_kind: Mapped[str | None] = mapped_column(String(30), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_checked_on: Mapped[date | None] = mapped_column(Date, nullable=True)

class Requirement(Base):
    __tablename__ = "requirements"
    id: Mapped[int] = mapped_column(primary_key=True)
    opportunity_id: Mapped[int] = mapped_column(ForeignKey("opportunities.id"))
    kind: Mapped[str] = mapped_column(String(30))
    operator: Mapped[str] = mapped_column(String(20))
    value: Mapped[str] = mapped_column(String(120))
    mandatory: Mapped[bool] = mapped_column(Boolean, default=True)

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    cost_bob: Mapped[float] = mapped_column(Float, default=0)
    credential_kind: Mapped[str] = mapped_column(String(30))
    credential_value: Mapped[str] = mapped_column(String(120))
    credential_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    duration_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    delivery_mode: Mapped[str] = mapped_column(String(20), default="asincrono", server_default="asincrono", nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    issuer: Mapped[str] = mapped_column(String(120))
    source_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    source_kind: Mapped[str | None] = mapped_column(String(30), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    official_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_checked_on: Mapped[date | None] = mapped_column(Date, nullable=True)

class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("student_id", "course_id"), UniqueConstraint("student_user_id", "course_id", name="uq_enrollments_user_course"))
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int | None] = mapped_column(ForeignKey("profiles.id"), nullable=True)
    student_user_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("app_users.id", ondelete="CASCADE"), nullable=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

class CourseLesson(Base):
    __tablename__ = "course_lessons"
    __table_args__ = (UniqueConstraint("course_id", "position", name="uq_course_lesson_position"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(160))
    body: Mapped[str] = mapped_column(Text)

class CourseLessonCompletion(Base):
    __tablename__ = "course_lesson_completions"
    __table_args__ = (UniqueConstraint("student_user_id", "lesson_id", name="uq_student_lesson_completion"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    student_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("app_users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("course_lessons.id", ondelete="CASCADE"))
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class DemoCoursePayment(Base):
    __tablename__ = "demo_course_payments"
    __table_args__ = (
        UniqueConstraint("student_user_id", "idempotency_key", name="uq_course_payment_idempotency"),
        CheckConstraint("amount_bob >= 0", name="ck_demo_course_payment_amount"),
        CheckConstraint("status IN ('pending', 'proof_uploaded', 'confirmed', 'cancelled')", name="ck_demo_course_payment_status"),
    )
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    student_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("app_users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    idempotency_key: Mapped[str] = mapped_column(String(100))
    amount_bob: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(24), default="pending", nullable=False)
    proof_filename: Mapped[str | None] = mapped_column(String(180), nullable=True)
    proof_content_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    proof_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"))
    amount_bob: Mapped[float] = mapped_column(Float)
    category: Mapped[str] = mapped_column(String(60))
    date: Mapped[date] = mapped_column(Date)
