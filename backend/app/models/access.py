from datetime import datetime, timezone
from sqlalchemy import Integer, BigInteger, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class AppUser(Base):
    __tablename__ = "app_users"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(Text, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Organization(Base):
    __tablename__ = "organizations"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    owner_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('app_users.id'), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class StudentAccount(Base):
    __tablename__ = 'student_accounts'
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('app_users.id', ondelete='CASCADE'), primary_key=True)
    profile_id: Mapped[int|None] = mapped_column(ForeignKey('profiles.id', ondelete='SET NULL'), unique=True, nullable=True)

class OrganizationMember(Base):
    __tablename__ = 'organization_members'
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('app_users.id', ondelete='CASCADE'), primary_key=True)
    organization_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), primary_key=True)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    actor_user_id: Mapped[int|None] = mapped_column(BigInteger, ForeignKey('app_users.id'), nullable=True)
    action: Mapped[str] = mapped_column(Text)
    target_type: Mapped[str|None] = mapped_column(Text, nullable=True)
    target_id: Mapped[str|None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
