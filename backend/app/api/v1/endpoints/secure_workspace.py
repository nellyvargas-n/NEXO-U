"""Rutas autenticadas para la aplicación multiusuario (sin tocar endpoints demo)."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth_jwt import require_role
from app.models.access import AppUser, StudentAccount, Organization, AuditLog
from app.models.entities import Profile, Credential, Opportunity, Requirement, Course, Enrollment, Transaction
from app.models.extended import SchoolProfile, Notification, ReferralAgreement, ReferralEvent, OrganizationOpportunity, OrganizationCourse
from app.services.matching_service import evaluate

router = APIRouter(tags=["Espacio seguro multiusuario"])

class ProfileIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    career: str = Field(min_length=2, max_length=120)
    semester: int = Field(ge=1, le=20)
    age: int = Field(ge=13, le=110)
    city: str = Field(default="La Paz", max_length=120)

class CredentialIn(BaseModel):
    kind: str = Field(pattern="^(skill|language|certificate)$")
    value: str = Field(min_length=1, max_length=120)
    level: str | None = Field(default=None, max_length=20)

class OpportunityIn(BaseModel):
    organization_id: int
    title: str = Field(min_length=3, max_length=200)
    category: str = Field(pattern="^(beca|pasantia|patrocinio|curso)$")
    deadline: date
    official_url: HttpUrl
    amount_bob: float = Field(default=0, ge=0)

class RequirementIn(BaseModel):
    kind: str = Field(pattern="^(career|semester|age|skill|language|certificate)$")
    operator: str = Field(default="eq", max_length=20)
    value: str = Field(min_length=1, max_length=120)
    mandatory: bool = True

class CourseIn(BaseModel):
    organization_id: int
    title: str = Field(min_length=3, max_length=200)
    end_date: date
    cost_bob: float = Field(ge=0)
    credential_kind: str = Field(pattern="^(skill|language|certificate)$")
    credential_value: str = Field(min_length=1, max_length=120)
    credential_level: str | None = None

class CompleteIn(BaseModel):
    student_user_id: int = Field(gt=0)

def student_profile(db, user):
    account = db.get(StudentAccount, user.id)
    if account is None or account.profile_id is None:
        raise HTTPException(404, "Primero completa tu perfil")
    profile = db.get(Profile, account.profile_id)
    if profile is None: raise HTTPException(404, "Perfil no encontrado")
    return profile

def owned_org(db, user, org_id):
    org=db.get(Organization,org_id)
    if org is None: raise HTTPException(404, "Organización no encontrada")
    if org.owner_user_id != user.id: raise HTTPException(403, "No eres propietario de esta organización")
    return org

@router.put("/usuario/perfil")
def upsert_profile(body:ProfileIn, user:AppUser=Depends(require_role("usuario")), db:Session=Depends(get_db)):
    if db.get(SchoolProfile,user.id) is not None:raise HTTPException(409,"Ya tienes perfil escolar; no mezcles datos académicos")
    account=db.get(StudentAccount,user.id)
    if account is None:
        account=StudentAccount(user_id=user.id);db.add(account);db.flush()
    profile=db.get(Profile,account.profile_id) if account.profile_id else None
    if profile is None:
        profile=Profile(**body.model_dump());db.add(profile);db.flush();account.profile_id=profile.id
    else:
        for k,v in body.model_dump().items(): setattr(profile,k,v)
    db.commit()
    return {"id":profile.id,**body.model_dump()}

@router.get("/usuario/perfil")
def my_profile(user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    p=student_profile(db,user)
    return {"id":p.id,"name":p.name,"career":p.career,"semester":p.semester,"age":p.age,"city":p.city}

@router.post("/usuario/credenciales",status_code=201)
def add_credential(body:CredentialIn,user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    p=student_profile(db,user)
    c=Credential(student_id=p.id,**body.model_dump(),verified=False,issuer=None)
    db.add(c);db.commit();db.refresh(c)
    return {"id":c.id,"verified":False,"kind":c.kind,"value":c.value,"level":c.level}

@router.get("/usuario/credenciales")
def my_credentials(user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    p=student_profile(db,user)
    return [{"id":c.id,"kind":c.kind,"value":c.value,"level":c.level,"verified":c.verified,"issuer":c.issuer} for c in db.scalars(select(Credential).where(Credential.student_id==p.id)).all()]

@router.get("/usuario/match")
def my_match(user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    p=student_profile(db,user)
    return evaluate(db,student_id=p.id)

@router.post("/usuario/cursos/{course_id}/inscribir",status_code=201)
def enroll(course_id:int,user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    p=student_profile(db,user)
    if db.get(Course,course_id) is None: raise HTTPException(404,"Curso no encontrado")
    existing=db.scalar(select(Enrollment).where(Enrollment.student_id==p.id,Enrollment.course_id==course_id))
    if existing: return {"id":existing.id,"completed":existing.completed}
    row=Enrollment(student_id=p.id,course_id=course_id,completed=False)
    db.add(row);db.commit();db.refresh(row)
    return {"id":row.id,"completed":False}

@router.get("/usuario/inscripciones")
def my_enrollments(user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    p=student_profile(db,user)
    return [{"id":e.id,"course_id":e.course_id,"completed":e.completed} for e in db.scalars(select(Enrollment).where(Enrollment.student_id==p.id)).all()]

@router.post("/empresa/oportunidades",status_code=201)
def publish(body:OpportunityIn,user:AppUser=Depends(require_role("empresa")),db:Session=Depends(get_db)):
    org=owned_org(db,user,body.organization_id)
    if not org.verified: raise HTTPException(403,"La organización debe ser verificada por un administrador")
    if body.deadline < date.today():raise HTTPException(422,"Fecha límite vencida")
    row=Opportunity(title=body.title,category=body.category,deadline=body.deadline,official_url=str(body.official_url),amount_bob=body.amount_bob)
    db.add(row);db.flush()
    db.execute(__import__('sqlalchemy').text('INSERT INTO organization_opportunities (organization_id, opportunity_id) VALUES (:org,:opp)'),{'org':org.id,'opp':row.id})
    db.commit()
    return {"id":row.id,"title":row.title,"organization_id":org.id}

@router.post("/empresa/oportunidades/{opportunity_id}/requisitos",status_code=201)
def add_requirement(opportunity_id:int,body:RequirementIn,user:AppUser=Depends(require_role("empresa")),db:Session=Depends(get_db)):
    from sqlalchemy import text
    found=db.execute(text('SELECT 1 FROM organization_opportunities oo JOIN organizations o ON o.id=oo.organization_id WHERE oo.opportunity_id=:oid AND o.owner_user_id=:uid'),{'oid':opportunity_id,'uid':user.id}).first()
    if not found: raise HTTPException(403,"Oportunidad ajena o inexistente")
    row=Requirement(opportunity_id=opportunity_id,**body.model_dump())
    db.add(row);db.commit();db.refresh(row)
    return {"id":row.id,"opportunity_id":opportunity_id}

@router.post("/empresa/cursos",status_code=201)
def create_course(body:CourseIn,user:AppUser=Depends(require_role("empresa")),db:Session=Depends(get_db)):
    from sqlalchemy import text
    org=owned_org(db,user,body.organization_id)
    if not org.verified: raise HTTPException(403,"La organización debe ser verificada")
    if body.end_date < date.today():raise HTTPException(422,"El curso debe terminar en el futuro")
    row=Course(title=body.title,end_date=body.end_date,cost_bob=body.cost_bob,credential_kind=body.credential_kind,credential_value=body.credential_value,credential_level=body.credential_level,issuer=org.name)
    db.add(row);db.flush()
    db.execute(text('INSERT INTO organization_courses (organization_id,course_id) VALUES (:org,:course)'),{'org':org.id,'course':row.id})
    db.commit()
    return {"id":row.id,"title":row.title}

@router.post("/empresa/cursos/{course_id}/validar")
def validate_completion(course_id:int,body:CompleteIn,user:AppUser=Depends(require_role("empresa")),db:Session=Depends(get_db)):
    from sqlalchemy import text
    found=db.execute(text('SELECT 1 FROM organization_courses oc JOIN organizations o ON o.id=oc.organization_id WHERE oc.course_id=:cid AND o.owner_user_id=:uid AND o.verified=true'),{'cid':course_id,'uid':user.id}).first()
    if not found: raise HTTPException(403,"No puedes validar este curso")
    course=db.get(Course,course_id)
    account=db.get(StudentAccount,body.student_user_id)
    if not account or not account.profile_id: raise HTTPException(404,"Estudiante sin perfil")
    enrollment=db.scalar(select(Enrollment).where(Enrollment.student_id==account.profile_id,Enrollment.course_id==course_id))
    if enrollment is None: raise HTTPException(409,"El estudiante debe estar inscrito")
    if enrollment.completed: return {"status":"already_completed"}
    enrollment.completed=True
    db.add(Credential(student_id=account.profile_id,kind=course.credential_kind,value=course.credential_value,level=course.credential_level,verified=True,issuer=course.issuer))
    db.add(AuditLog(actor_user_id=user.id,action="validate_course",target_type="enrollments",target_id=str(enrollment.id)))
    db.add(Notification(user_id=body.student_user_id,title="Credencial validada",message=f"Tu curso {course.title} fue validado; vuelve a consultar tu matching."))
    agreements=db.scalars(select(ReferralAgreement).where(ReferralAgreement.course_id==course_id,ReferralAgreement.active.is_(True))).all()
    for a in agreements:
        ev=db.scalar(select(ReferralEvent).where(ReferralEvent.agreement_id==a.id,ReferralEvent.student_user_id==body.student_user_id))
        if ev:ev.completed=True
    db.commit()
    return {"status":"completed","student_user_id":body.student_user_id,"course_id":course_id}
