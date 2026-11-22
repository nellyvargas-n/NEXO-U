"""Rutas autenticadas para la aplicación multiusuario (sin tocar endpoints demo)."""
import base64
import binascii
from datetime import date, datetime, timezone
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, HttpUrl, model_validator
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.auth_jwt import require_role
from app.models.access import AppUser, StudentAccount, Organization, AuditLog
from app.models.entities import (Profile, Credential, Opportunity, Requirement, Course, Enrollment, Transaction,
                                 CourseLesson, CourseLessonCompletion, DemoCoursePayment)
from app.models.extended import SchoolProfile, Notification, ReferralAgreement, ReferralEvent, OrganizationOpportunity, OrganizationCourse
from app.services.matching_service import evaluate
from app.services.student_identity import get_student_context, owned_credentials_filter, owned_enrollments_filter, profile_fk

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
    kind: str = Field(pattern="^(career|semester|age|skill|language|certificate|city|average_grade|math_grade|graduation_year)$")
    operator: str = Field(default="eq", max_length=20)
    value: str = Field(min_length=1, max_length=120)
    mandatory: bool = True

    @model_validator(mode="after")
    def validate_rule(self):
        valid_operators={"career":{"in"},"semester":{">="},"age":{"between"},
                         "skill":{"has"},"language":{"A1","A2","B1","B2","C1","C2"},
                         "certificate":{"has"},"city":{"in"}, "average_grade":{">="}, "math_grade":{">="}, "graduation_year":{"eq"}}
        self.value=self.value.strip()
        self.operator=self.operator.strip()
        if self.operator not in valid_operators[self.kind]:
            raise ValueError("Operador inválido para este tipo de requisito")
        if self.kind=="semester" and (not self.value.isdigit() or not 1<=int(self.value)<=20):
            raise ValueError("Semestre requerido debe estar entre 1 y 20")
        if self.kind=="age":
            parts=self.value.split('-')
            if len(parts)!=2 or not all(p.isdigit() for p in parts) or not 0<=int(parts[0])<=int(parts[1])<=120:
                raise ValueError("Edad debe tener formato mínimo-máximo, por ejemplo 18-25")
        if self.kind in ("average_grade","math_grade"):
            from decimal import Decimal, InvalidOperation
            try:
                number=Decimal(self.value)
                if not number.is_finite() or number<0 or number>100: raise ValueError()
            except (InvalidOperation,ValueError):raise ValueError("Nota requerida debe estar entre 0 y 100")
        if self.kind=="graduation_year" and (not self.value.isdigit() or not 2020<=int(self.value)<=2100):
            raise ValueError("Año de graduación inválido")
        if not self.value or (self.kind in ("career","city") and any(not part.strip() for part in self.value.split('|'))):
            raise ValueError("Valor vacío o lista de carreras inválida")
        return self

class CourseIn(BaseModel):
    organization_id: int
    title: str = Field(min_length=3, max_length=200)
    start_date: date | None = None
    end_date: date | None = None
    duration_hours: int | None = Field(default=None, ge=1, le=2000)
    delivery_mode: Literal["asincrono", "sincronico", "mixto"] = "asincrono"
    cost_bob: float = Field(ge=0)
    credential_kind: str = Field(pattern="^(skill|language|certificate)$")
    credential_value: str = Field(min_length=1, max_length=120)
    credential_level: str | None = None

class CompleteIn(BaseModel):
    student_user_id: int = Field(gt=0)

class CourseCheckoutIn(BaseModel):
    idempotency_key: str = Field(min_length=8, max_length=100)

class CourseProofIn(BaseModel):
    filename: str = Field(min_length=1, max_length=180)
    content_type: str = Field(min_length=1, max_length=80)
    data_base64: str = Field(min_length=1, max_length=2_800_000)

class CourseLessonCompleteIn(BaseModel):
    completed: bool = True

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

@router.post("/usuario/credenciales", status_code=201)
def add_credential(body:CredentialIn, user:AppUser=Depends(require_role("usuario")), db:Session=Depends(get_db)):
    profile_type, profile = get_student_context(db, user.id)
    row = Credential(student_id=profile_fk(profile_type,profile), student_user_id=user.id,
                     **body.model_dump(), verified=False, issuer=None)
    db.add(row); db.commit(); db.refresh(row)
    return {"id":row.id,"verified":False,"kind":row.kind,"value":row.value,"level":row.level}

@router.get("/usuario/credenciales")
def my_credentials(user:AppUser=Depends(require_role("usuario")), db:Session=Depends(get_db)):
    profile_type, profile = get_student_context(db, user.id)
    rows = db.scalars(select(Credential).where(owned_credentials_filter(user.id,profile_type,profile))).all()
    return [{"id":c.id,"kind":c.kind,"value":c.value,"level":c.level,"verified":c.verified,"issuer":c.issuer}
            for c in rows]

@router.delete("/usuario/credenciales/{credential_id}")
def remove_credential(credential_id:int,user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    profile_type, profile = get_student_context(db, user.id)
    item=db.scalar(select(Credential).where(Credential.id==credential_id,
                          owned_credentials_filter(user.id, profile_type, profile)))
    if item is None: raise HTTPException(404,"Credencial no encontrada")
    if item.verified: raise HTTPException(403,"Una credencial validada por un emisor no se puede eliminar desde esta ruta")
    db.delete(item); db.commit()
    return {"deleted":True}

@router.get("/usuario/match")
def my_match(user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    # Funciona tanto para universitarios como para escolares; 404 solo si no existe NINGÚN perfil.
    get_student_context(db, user.id)
    return evaluate(db, student_user_id=user.id)

@router.post("/usuario/cursos/{course_id}/inscribir",status_code=201)
def enroll(course_id:int,user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    profile_type, profile = get_student_context(db, user.id)
    course=db.get(Course,course_id)
    if course is None: raise HTTPException(404,"Curso no encontrado")
    if float(course.cost_bob or 0) > 0:
        raise HTTPException(409,"Este curso requiere completar la inscripción desde su proceso de pago")
    if course.source_name:
        raise HTTPException(409,"Este curso se inscribe en el sitio de la institución; abre su enlace público")
    if course.start_date is not None and course.start_date < date.today():raise HTTPException(409,"El curso ya comenzó")
    if course.end_date is not None and course.end_date < date.today():raise HTTPException(409,"El curso ya terminó")
    if not settings.demo_mode:
        permitted=db.scalar(select(OrganizationCourse).join(Organization, Organization.id==OrganizationCourse.organization_id)
                            .where(OrganizationCourse.course_id==course_id,Organization.verified.is_(True)))
        if permitted is None:raise HTTPException(404,"Curso no disponible")
    existing=db.scalar(select(Enrollment).where(Enrollment.course_id==course_id,
                       owned_enrollments_filter(user.id,profile_type,profile)))
    if existing:
        if existing.student_user_id is None:  # migración progresiva de cuentas universitarias existentes
            existing.student_user_id=user.id; db.commit()
        return {"id":existing.id,"completed":existing.completed}
    row=Enrollment(student_id=profile_fk(profile_type,profile), student_user_id=user.id,
                   course_id=course_id, completed=False)
    db.add(row); db.commit(); db.refresh(row)
    return {"id":row.id,"completed":False}


def _learning_course(db: Session, course_id: int) -> Course:
    if settings.environment == "production":
        raise HTTPException(404, "Curso no encontrado")
    course = db.get(Course, course_id)
    if course is None or not course.is_demo:
        raise HTTPException(404, "Curso no encontrado")
    return course


def _payment_payload(payment: DemoCoursePayment):
    return {"payment_id": payment.id, "course_id": payment.course_id,
            "amount_bob": payment.amount_bob, "status": payment.status,
            "proof_uploaded": payment.status in ("proof_uploaded", "confirmed"),
            "learning_url": f"/app/cursos/contenido?course={payment.course_id}" if payment.status == "confirmed" else None}


@router.post("/usuario/cursos/{course_id}/checkout", status_code=201)
def start_course_checkout(course_id: int, body: CourseCheckoutIn,
                          user: AppUser = Depends(require_role("usuario")), db: Session = Depends(get_db)):
    profile_type, profile = get_student_context(db, user.id)
    course = _learning_course(db, course_id)
    if course.start_date is not None and course.start_date < date.today():
        raise HTTPException(409, "El curso ya comenzó")
    if course.end_date is not None and course.end_date < date.today():
        raise HTTPException(409, "El curso ya terminó")
    payment = db.scalar(select(DemoCoursePayment).where(
        DemoCoursePayment.student_user_id == user.id,
        DemoCoursePayment.idempotency_key == body.idempotency_key,
    ))
    if payment and payment.course_id != course_id:
        raise HTTPException(409, "La clave de inscripción ya fue utilizada")
    if payment is not None:
        return _payment_payload(payment)
    enrolled = db.scalar(select(Enrollment).where(
        Enrollment.course_id == course_id, owned_enrollments_filter(user.id, profile_type, profile)))
    if enrolled:
        raise HTTPException(409, "Ya tienes una inscripción para este curso")
    payment = DemoCoursePayment(student_user_id=user.id, course_id=course_id,
                                idempotency_key=body.idempotency_key,
                                amount_bob=float(course.cost_bob or 0), status="pending")
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return _payment_payload(payment)


@router.get("/usuario/cursos/pagos/{payment_id}")
def course_checkout_status(payment_id: int, user: AppUser = Depends(require_role("usuario")),
                           db: Session = Depends(get_db)):
    payment = db.scalar(select(DemoCoursePayment).where(
        DemoCoursePayment.id == payment_id, DemoCoursePayment.student_user_id == user.id))
    if payment is None:
        raise HTTPException(404, "Inscripción no encontrada")
    return _payment_payload(payment)


@router.post("/usuario/cursos/pagos/{payment_id}/comprobante")
def upload_course_proof(payment_id: int, body: CourseProofIn,
                        user: AppUser = Depends(require_role("usuario")), db: Session = Depends(get_db)):
    payment = db.scalar(select(DemoCoursePayment).where(
        DemoCoursePayment.id == payment_id, DemoCoursePayment.student_user_id == user.id))
    if payment is None:
        raise HTTPException(404, "Inscripción no encontrada")
    if payment.status not in ("pending", "proof_uploaded"):
        raise HTTPException(409, "El comprobante ya fue recibido")
    try:
        proof = base64.b64decode(body.data_base64, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(422, "El archivo no tiene un formato válido")
    if len(proof) > 2 * 1024 * 1024:
        raise HTTPException(413, "El archivo debe pesar 2 MB o menos")
    file_type = body.content_type.lower().split(";", 1)[0].strip()
    signatures = {
        "application/pdf": proof.startswith(b"%PDF-"),
        "image/png": proof.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/jpeg": proof.startswith(b"\xff\xd8\xff"),
    }
    if not signatures.get(file_type, False):
        raise HTTPException(422, "Adjunta un comprobante PDF, PNG o JPG válido")
    payment.proof_filename = body.filename.replace("\\", "/").split("/")[-1]
    payment.proof_content_type = file_type
    payment.proof_data = proof
    payment.status = "proof_uploaded"
    db.commit()
    return _payment_payload(payment)


@router.post("/usuario/cursos/pagos/{payment_id}/finalizar")
def finalize_course_checkout(payment_id: int, user: AppUser = Depends(require_role("usuario")),
                              db: Session = Depends(get_db)):
    payment = db.scalar(select(DemoCoursePayment).where(
        DemoCoursePayment.id == payment_id, DemoCoursePayment.student_user_id == user.id))
    if payment is None:
        raise HTTPException(404, "Inscripción no encontrada")
    course = _learning_course(db, payment.course_id)
    if payment.status == "confirmed":
        return _payment_payload(payment)
    if payment.status != "proof_uploaded":
        raise HTTPException(409, "Sube el comprobante antes de finalizar la inscripción")
    profile_type, profile = get_student_context(db, user.id)
    enrollment = db.scalar(select(Enrollment).where(
        Enrollment.course_id == course.id, owned_enrollments_filter(user.id, profile_type, profile)))
    if enrollment is None:
        enrollment = Enrollment(student_id=profile_fk(profile_type, profile), student_user_id=user.id,
                                course_id=course.id, completed=False)
        db.add(enrollment)
    elif enrollment.student_user_id is None:
        enrollment.student_user_id = user.id
    payment.status = "confirmed"
    payment.confirmed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(payment)
    return _payment_payload(payment)


def _require_confirmed_learning_enrollment(db: Session, user: AppUser, course: Course):
    profile_type, profile = get_student_context(db, user.id)
    enrollment = db.scalar(select(Enrollment).where(
        Enrollment.course_id == course.id, owned_enrollments_filter(user.id, profile_type, profile)))
    if enrollment is None:
        raise HTTPException(403, "Completa tu inscripción para acceder al curso")
    confirmed = db.scalar(select(DemoCoursePayment.id).where(
        DemoCoursePayment.student_user_id == user.id,
        DemoCoursePayment.course_id == course.id,
        DemoCoursePayment.status == "confirmed"))
    if confirmed is None:
        raise HTTPException(403, "Completa tu inscripción para acceder al curso")
    return profile_type, profile, enrollment


@router.get("/usuario/cursos/{course_id}/contenido")
def course_content(course_id: int, user: AppUser = Depends(require_role("usuario")),
                   db: Session = Depends(get_db)):
    course = _learning_course(db, course_id)
    _, _, enrollment = _require_confirmed_learning_enrollment(db, user, course)
    lessons = db.scalars(select(CourseLesson).where(CourseLesson.course_id == course_id)
                         .order_by(CourseLesson.position)).all()
    completed_ids = set(db.scalars(select(CourseLessonCompletion.lesson_id).where(
        CourseLessonCompletion.student_user_id == user.id,
        CourseLessonCompletion.course_id == course_id)).all())
    return {"course": {"id": course.id, "title": course.title,
                       "credential_kind": course.credential_kind,
                       "credential_value": course.credential_value,
                       "completed": enrollment.completed},
            "lessons": [{"id": lesson.id, "position": lesson.position,
                         "title": lesson.title, "body": lesson.body,
                         "completed": lesson.id in completed_ids} for lesson in lessons]}


@router.post("/usuario/cursos/{course_id}/lecciones/{lesson_id}/completar")
def complete_course_lesson(course_id: int, lesson_id: int, body: CourseLessonCompleteIn,
                            user: AppUser = Depends(require_role("usuario")), db: Session = Depends(get_db)):
    course = _learning_course(db, course_id)
    _require_confirmed_learning_enrollment(db, user, course)
    lesson = db.scalar(select(CourseLesson).where(CourseLesson.id == lesson_id,
                                                 CourseLesson.course_id == course_id))
    if lesson is None:
        raise HTTPException(404, "Lección no encontrada")
    completion = db.scalar(select(CourseLessonCompletion).where(
        CourseLessonCompletion.student_user_id == user.id,
        CourseLessonCompletion.lesson_id == lesson_id))
    if body.completed and completion is None:
        try:
            with db.begin_nested():
                db.add(CourseLessonCompletion(student_user_id=user.id, course_id=course_id, lesson_id=lesson_id))
                db.flush()
        except IntegrityError:
            pass
    elif not body.completed and completion is not None:
        db.delete(completion)
    db.commit()
    total = db.scalar(select(func.count()).select_from(CourseLesson)
                      .where(CourseLesson.course_id == course_id)) or 0
    finished = db.scalar(select(func.count()).select_from(CourseLessonCompletion)
                         .where(CourseLessonCompletion.student_user_id == user.id,
                                CourseLessonCompletion.course_id == course_id)) or 0
    return {"completed": body.completed, "finished_lessons": finished, "total_lessons": total}


@router.post("/usuario/cursos/{course_id}/finalizar")
def finish_course(course_id: int, user: AppUser = Depends(require_role("usuario")),
                  db: Session = Depends(get_db)):
    course = _learning_course(db, course_id)
    profile_type, profile, enrollment = _require_confirmed_learning_enrollment(db, user, course)
    lessons = db.scalar(select(func.count()).select_from(CourseLesson)
                        .where(CourseLesson.course_id == course_id)) or 0
    completed_lessons = db.scalar(select(func.count()).select_from(CourseLessonCompletion)
                                  .where(CourseLessonCompletion.student_user_id == user.id,
                                         CourseLessonCompletion.course_id == course_id)) or 0
    if lessons == 0 or completed_lessons != lessons:
        raise HTTPException(409, "Completa todas las lecciones antes de finalizar el curso")
    if not enrollment.completed:
        enrollment.completed = True
        credential = db.scalar(select(Credential).where(
            owned_credentials_filter(user.id, profile_type, profile),
            Credential.kind == course.credential_kind,
            Credential.value.ilike(course.credential_value)))
        if credential is None:
            db.add(Credential(student_id=profile_fk(profile_type, profile), student_user_id=user.id,
                              kind=course.credential_kind, value=course.credential_value,
                              level=course.credential_level, verified=False, issuer=course.issuer))
        db.commit()
    return {"status": "completed", "course_id": course.id,
            "credential": {"kind": course.credential_kind, "value": course.credential_value,
                           "verified": False}}

@router.get("/usuario/inscripciones")
def my_enrollments(user:AppUser=Depends(require_role("usuario")),db:Session=Depends(get_db)):
    profile_type, profile = get_student_context(db, user.id)
    rows=db.scalars(select(Enrollment).where(owned_enrollments_filter(user.id,profile_type,profile))).all()
    result = []
    for enrollment in rows:
        course = db.get(Course, enrollment.course_id)
        confirmed_payment = db.scalar(select(DemoCoursePayment.id).where(
            DemoCoursePayment.student_user_id == user.id,
            DemoCoursePayment.course_id == enrollment.course_id,
            DemoCoursePayment.status == "confirmed"))
        can_open_content = (settings.environment != "production" and course is not None
                            and course.is_demo and confirmed_payment is not None)
        result.append({"id": enrollment.id, "course_id": enrollment.course_id,
                       "completed": enrollment.completed,
                       "validation_status": "validado" if enrollment.completed else "pendiente",
                       "learning_url": f"/app/cursos/contenido?course={enrollment.course_id}"
                       if can_open_content else None})
    return result

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
    if body.start_date is not None and body.start_date < date.today():raise HTTPException(422,"El curso no puede empezar en el pasado")
    if body.end_date is not None and body.end_date < date.today():raise HTTPException(422,"El curso debe terminar en el futuro")
    row=Course(title=body.title,start_date=body.start_date,end_date=body.end_date,duration_hours=body.duration_hours,
               delivery_mode=body.delivery_mode,cost_bob=body.cost_bob,credential_kind=body.credential_kind,
               credential_value=body.credential_value,credential_level=body.credential_level,issuer=org.name)
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
    profile_type, profile = get_student_context(db, body.student_user_id)
    enrollment=db.scalar(select(Enrollment).where(Enrollment.course_id==course_id,
                         owned_enrollments_filter(body.student_user_id,profile_type,profile)))
    if enrollment is None: raise HTTPException(409,"El estudiante debe estar inscrito")
    if enrollment.completed: return {"status":"already_completed"}
    enrollment.completed=True
    enrollment.student_user_id=body.student_user_id
    db.add(Credential(student_id=profile_fk(profile_type,profile),student_user_id=body.student_user_id,
                      kind=course.credential_kind,value=course.credential_value,
                      level=course.credential_level,verified=True,issuer=course.issuer))
    db.add(AuditLog(actor_user_id=user.id,action="validate_course",target_type="enrollments",target_id=str(enrollment.id)))
    db.add(Notification(user_id=body.student_user_id,title="Credencial validada",message=f"Tu curso {course.title} fue validado; vuelve a consultar tu matching."))
    agreements=db.scalars(select(ReferralAgreement).where(ReferralAgreement.course_id==course_id,ReferralAgreement.active.is_(True))).all()
    for a in agreements:
        ev=db.scalar(select(ReferralEvent).where(ReferralEvent.agreement_id==a.id,ReferralEvent.student_user_id==body.student_user_id))
        if ev:ev.completed=True
    db.commit()
    return {"status":"completed","student_user_id":body.student_user_id,"course_id":course_id}
