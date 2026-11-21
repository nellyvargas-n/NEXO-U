from datetime import date
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Date, UniqueConstraint
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
    student_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"))
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
    deadline: Mapped[date] = mapped_column(Date)
    official_url: Mapped[str] = mapped_column(String(500))
    amount_bob: Mapped[float] = mapped_column(Float, default=0)

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
    end_date: Mapped[date] = mapped_column(Date)
    cost_bob: Mapped[float] = mapped_column(Float, default=0)
    credential_kind: Mapped[str] = mapped_column(String(30))
    credential_value: Mapped[str] = mapped_column(String(120))
    credential_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    issuer: Mapped[str] = mapped_column(String(120))

class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("student_id", "course_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"))
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"))
    amount_bob: Mapped[float] = mapped_column(Float)
    category: Mapped[str] = mapped_column(String(60))
    date: Mapped[date] = mapped_column(Date)
