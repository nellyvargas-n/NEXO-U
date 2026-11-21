"""Tablas de módulos productivos adicionales. Sus propietarios siempre se validan desde la API."""
from datetime import date, datetime, timezone
from decimal import Decimal
from sqlalchemy import (BigInteger, Integer, String, Text, Boolean, Date, DateTime, ForeignKey,
                        Numeric, UniqueConstraint, CheckConstraint, Index)
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

PK = BigInteger().with_variant(Integer, 'sqlite')
def utcnow(): return datetime.now(timezone.utc)

class SchoolProfile(Base):
    __tablename__='school_profiles'
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id',ondelete='CASCADE'),primary_key=True)
    full_name:Mapped[str]=mapped_column(String(120),nullable=False)
    city:Mapped[str]=mapped_column(String(120),nullable=False)
    graduation_year:Mapped[int]=mapped_column(Integer,nullable=False)
    average_grade:Mapped[Decimal]=mapped_column(Numeric(5,2),nullable=False)
    math_grade:Mapped[Decimal]=mapped_column(Numeric(5,2),nullable=False)
    updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,onupdate=utcnow)
    __table_args__=(CheckConstraint('average_grade >= 0 AND average_grade <= 100',name='ck_school_average'),
                    CheckConstraint('math_grade >= 0 AND math_grade <= 100',name='ck_school_math'),)

class ScholarshipBand(Base):
    __tablename__='scholarship_bands'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    opportunity_id:Mapped[int]=mapped_column(ForeignKey('opportunities.id',ondelete='CASCADE'),nullable=False)
    percent_discount:Mapped[int]=mapped_column(Integer,nullable=False)
    min_average:Mapped[Decimal]=mapped_column(Numeric(5,2),nullable=False)
    min_math:Mapped[Decimal]=mapped_column(Numeric(5,2),nullable=False)
    official_published:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
    approved_by_admin:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
    official_url:Mapped[str]=mapped_column(String(500),nullable=False)
    __table_args__=(UniqueConstraint('opportunity_id','percent_discount',name='uq_band_opportunity_percent'),
        CheckConstraint('percent_discount BETWEEN 1 AND 100',name='ck_percent_band'),
        CheckConstraint('min_average BETWEEN 0 AND 100',name='ck_min_avg_band'),
        CheckConstraint('min_math BETWEEN 0 AND 100',name='ck_min_math_band'))

class FinanceEntry(Base):
    __tablename__='finance_entries'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id',ondelete='CASCADE'),nullable=False,index=True)
    direction:Mapped[str]=mapped_column(String(10),nullable=False)
    amount_bob:Mapped[Decimal]=mapped_column(Numeric(12,2),nullable=False)
    category:Mapped[str]=mapped_column(String(80),nullable=False)
    happened_on:Mapped[date]=mapped_column(Date,nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow)
    __table_args__=(CheckConstraint("direction IN ('income','expense')",name='ck_entry_direction'),
                    CheckConstraint('amount_bob > 0',name='ck_entry_amount'))

class FinanceBudget(Base):
    __tablename__='finance_budgets'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id',ondelete='CASCADE'),nullable=False,index=True)
    category:Mapped[str]=mapped_column(String(80),nullable=False)
    month:Mapped[str]=mapped_column(String(7),nullable=False)
    limit_bob:Mapped[Decimal]=mapped_column(Numeric(12,2),nullable=False)
    __table_args__=(UniqueConstraint('user_id','category','month',name='uq_budget_month'),
                    CheckConstraint('limit_bob >= 0',name='ck_budget_limit'))

class FinanceObligation(Base):
    __tablename__='finance_obligations'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id',ondelete='CASCADE'),nullable=False,index=True)
    title:Mapped[str]=mapped_column(String(120),nullable=False)
    amount_bob:Mapped[Decimal]=mapped_column(Numeric(12,2),nullable=False)
    due_on:Mapped[date]=mapped_column(Date,nullable=False)
    paid:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
    __table_args__=(CheckConstraint('amount_bob >= 0',name='ck_obligation_amount'),)

class SavedOpportunity(Base):
    __tablename__='saved_opportunities'
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id',ondelete='CASCADE'),primary_key=True)
    opportunity_id:Mapped[int]=mapped_column(ForeignKey('opportunities.id',ondelete='CASCADE'),primary_key=True)
    remind_on:Mapped[date|None]=mapped_column(Date,nullable=True)

class CommunityPost(Base):
    __tablename__='community_posts'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    author_user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id',ondelete='CASCADE'),nullable=False)
    title:Mapped[str]=mapped_column(String(150),nullable=False)
    body:Mapped[str]=mapped_column(Text,nullable=False)
    visible:Mapped[bool]=mapped_column(Boolean,default=True,nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow)

class CommunityComment(Base):
    __tablename__='community_comments'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    post_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('community_posts.id',ondelete='CASCADE'),nullable=False)
    author_user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id',ondelete='CASCADE'),nullable=False)
    body:Mapped[str]=mapped_column(Text,nullable=False)
    visible:Mapped[bool]=mapped_column(Boolean,default=True,nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow)

class CommunityEvent(Base):
    __tablename__='community_events'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    organization_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('organizations.id',ondelete='CASCADE'),nullable=False)
    title:Mapped[str]=mapped_column(String(150),nullable=False)
    description:Mapped[str]=mapped_column(Text,nullable=False)
    starts_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),nullable=False)
    public_url:Mapped[str|None]=mapped_column(String(500),nullable=True)
    published:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)

class Notification(Base):
    __tablename__='notifications'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id',ondelete='CASCADE'),nullable=False,index=True)
    title:Mapped[str]=mapped_column(String(150),nullable=False)
    message:Mapped[str]=mapped_column(Text,nullable=False)
    read:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow)

class InstitutionalCampaign(Base):
    __tablename__='institutional_campaigns'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    organization_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('organizations.id'),nullable=False)
    title:Mapped[str]=mapped_column(Text,nullable=False)
    sponsorship_disclosed:Mapped[bool]=mapped_column(Boolean,default=True,nullable=False)
    starts_on:Mapped[date|None]=mapped_column(Date,nullable=True)
    ends_on:Mapped[date|None]=mapped_column(Date,nullable=True)
    status:Mapped[str]=mapped_column(Text,default='draft',nullable=False)
    __table_args__=(CheckConstraint("status IN ('draft','active','paused','finished')",name='ck_campaign_status'),)

class ReferralAgreement(Base):
    __tablename__='referral_agreements'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    organization_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('organizations.id'),nullable=False)
    course_id:Mapped[int|None]=mapped_column(Integer,ForeignKey('courses.id'),nullable=True)
    commission_bob:Mapped[Decimal|None]=mapped_column(Numeric(12,2),nullable=True)
    disclosed:Mapped[bool]=mapped_column(Boolean,default=True,nullable=False)
    active:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
    __table_args__=(CheckConstraint('commission_bob IS NULL OR commission_bob >= 0',name='ck_commission_positive'),)

class ReferralEvent(Base):
    __tablename__='referral_events'
    id:Mapped[int]=mapped_column(PK,primary_key=True,autoincrement=True)
    agreement_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('referral_agreements.id'),nullable=False)
    student_user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('app_users.id'),nullable=False)
    completed:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow)
    __table_args__=(UniqueConstraint('agreement_id','student_user_id',name='uq_referral_student'),)

class OrganizationOpportunity(Base):
    __tablename__='organization_opportunities'
    organization_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('organizations.id',ondelete='CASCADE'),primary_key=True)
    opportunity_id:Mapped[int]=mapped_column(Integer,ForeignKey('opportunities.id',ondelete='CASCADE'),unique=True,primary_key=True)

class OrganizationCourse(Base):
    __tablename__='organization_courses'
    organization_id:Mapped[int]=mapped_column(BigInteger,ForeignKey('organizations.id',ondelete='CASCADE'),primary_key=True)
    course_id:Mapped[int]=mapped_column(Integer,ForeignKey('courses.id',ondelete='CASCADE'),unique=True,primary_key=True)
