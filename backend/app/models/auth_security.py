"""Tokens de recuperación y limitación de intentos (solo hashes, nunca tokens sin cifrar)."""
from datetime import datetime, timezone
from sqlalchemy import BigInteger, Integer, DateTime, ForeignKey, String, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

def now_utc():
    return datetime.now(timezone.utc)

class PasswordResetToken(Base):
    __tablename__ = 'password_reset_tokens'
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, 'sqlite'), primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('app_users.id',ondelete='CASCADE'), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime|None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

class AuthAttempt(Base):
    __tablename__ = 'auth_attempts'
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer,'sqlite'), primary_key=True, autoincrement=True)
    key_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    __table_args__ = (Index('ix_auth_attempts_key_time','key_hash','created_at'),)
