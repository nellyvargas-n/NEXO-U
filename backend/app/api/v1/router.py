from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.entities import Profile,Credential,Opportunity,Course,Enrollment,Transaction,Requirement
from app.services.matching_service import evaluate
from app.services.finance_service import reach
from app.core.seed import seed
from app.core.auth_jwt import require_role, current_user

router=APIRouter(prefix="/api/v1")

def demo_access():
    if not settings.demo_mode:
        raise HTTPException(403,"Endpoint de demostración deshabilitado; usa rutas autenticadas")


class Completion(BaseModel):
    student_id: int = Field(default=1,ge=1)

@router.get("/profiles/me", dependencies=[Depends(demo_access)])
def profile(db:Session=Depends(get_db)):
    p=db.get(Profile,1)
    if p is None: raise HTTPException(404,"Perfil no encontrado")
    return {"id":p.id,"name":p.name,"career":p.career,"semester":p.semester,"age":p.age,"city":p.city}

@router.get("/credentials", dependencies=[Depends(demo_access)])
def credentials(db:Session=Depends(get_db)):
    return [{"id":c.id,"kind":c.kind,"value":c.value,"level":c.level,"verified":c.verified,"issuer":c.issuer} for c in db.scalars(select(Credential).where(Credential.student_id==1)).all()]

@router.get("/opportunities")
def opportunities(db:Session=Depends(get_db)):
    return [{"id":o.id,"title":o.title,"category":o.category,"deadline":o.deadline,"official_url":o.official_url,"amount_bob":o.amount_bob} for o in db.scalars(select(Opportunity)).all()]

@router.get("/match", dependencies=[Depends(demo_access)])
def match(db:Session=Depends(get_db)):
    return evaluate(db)

@router.get("/courses")
def courses(db:Session=Depends(get_db)):
    return [{"id":c.id,"title":c.title,"end_date":c.end_date,"cost_bob":c.cost_bob,"issuer":c.issuer} for c in db.scalars(select(Course)).all()]

@router.post("/courses/{course_id}/complete", dependencies=[Depends(demo_access)])
def complete(course_id:int, body:Completion, x_emitter_key:str|None=Header(default=None), db:Session=Depends(get_db)):
    if not x_emitter_key or x_emitter_key != settings.demo_emitter_key:
        raise HTTPException(403,"Solo el emisor autorizado puede validar")
    course=db.get(Course,course_id)
    if course is None: raise HTTPException(404,"Curso no encontrado")
    if db.get(Profile,body.student_id) is None: raise HTTPException(404,"Estudiante no encontrado")
    existing=db.scalar(select(Enrollment).where(Enrollment.course_id==course_id,Enrollment.student_id==body.student_id))
    if existing and existing.completed:
        return {"status":"already_completed","student_id":body.student_id,"course_id":course_id}
    if existing is None:
        existing=Enrollment(student_id=body.student_id,course_id=course_id,completed=True)
        db.add(existing)
    else: existing.completed=True
    db.add(Credential(student_id=body.student_id,kind=course.credential_kind,value=course.credential_value,level=course.credential_level,verified=True,issuer=course.issuer))
    db.commit()
    return {"status":"completed","student_id":body.student_id,"course_id":course_id}

@router.get("/finance/reach", dependencies=[Depends(demo_access)])
def finance(db:Session=Depends(get_db),daily_expense:float=30.0,reserve:float=0.0):
    if daily_expense<0 or reserve<0: raise HTTPException(422,"Valores no pueden ser negativos")
    return reach(db,daily_expense=daily_expense,reserve=reserve)

@router.post("/demo/reset", dependencies=[Depends(demo_access)])
def reset(x_emitter_key:str|None=Header(default=None),db:Session=Depends(get_db)):
    if x_emitter_key != settings.demo_emitter_key or not x_emitter_key:
        raise HTTPException(403,"No autorizado")
    for model in [Enrollment,Credential,Requirement,Course,Opportunity,Transaction,Profile]:
        db.execute(delete(model))
    db.commit();seed(db)
    return {"status":"reset"}

from app.api.v1.endpoints.role_access import router as role_router
router.include_router(role_router)
