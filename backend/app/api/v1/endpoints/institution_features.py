"""Becas oficiales, campañas transparentes, referidos y métricas agregadas."""
from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.core.auth_jwt import require_role
from app.core.database import get_db
from app.models.access import AppUser, Organization, AuditLog, StudentAccount
from app.models.entities import Opportunity, Course, Enrollment
from app.models.extended import (ScholarshipBand, InstitutionalCampaign, ReferralAgreement,
    ReferralEvent, OrganizationOpportunity, OrganizationCourse)

router=APIRouter(tags=['Empresas, becas y sostenibilidad'])

def my_org(db,user,org_id:int,verified:bool=True):
    org=db.get(Organization,org_id)
    if org is None or org.owner_user_id!=user.id:raise HTTPException(404,'Organización inexistente o no pertenece a tu cuenta')
    if verified and not org.verified:raise HTTPException(403,'Un administrador debe verificar la organización')
    return org

def owned_opportunity(db,user,oid:int):
    mapping=db.scalar(select(OrganizationOpportunity).where(OrganizationOpportunity.opportunity_id==oid))
    if not mapping:raise HTTPException(404,'Oportunidad no encontrada o ajena')
    my_org(db,user,mapping.organization_id)
    opp=db.get(Opportunity,oid)
    if not opp:raise HTTPException(404,'Oportunidad no encontrada')
    return opp

class BandIn(BaseModel):
    percent_discount:int=Field(ge=1,le=100)
    min_average:Decimal=Field(ge=0,le=100,decimal_places=2)
    min_math:Decimal=Field(ge=0,le=100,decimal_places=2)
    official_published:bool=True
    official_url:HttpUrl

@router.put('/empresa/becas/{opportunity_id}/bandas')
def save_band(opportunity_id:int,body:BandIn,u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    opp=owned_opportunity(db,u,opportunity_id)
    if opp.category.casefold() not in ('beca','scholarship'):raise HTTPException(422,'Solo se agregan bandas a becas')
    if not body.official_published:raise HTTPException(422,'No se permiten porcentajes sin reglas oficialmente publicadas')
    band=db.scalar(select(ScholarshipBand).where(ScholarshipBand.opportunity_id==opportunity_id,ScholarshipBand.percent_discount==body.percent_discount))
    if band is None:
        band=ScholarshipBand(opportunity_id=opportunity_id,**{**body.model_dump(),'official_url':str(body.official_url)},approved_by_admin=False);db.add(band)
    else:
        for k,v in body.model_dump().items():setattr(band,k,str(v) if k=='official_url' else v)
        band.approved_by_admin=False
    db.commit();db.refresh(band)
    return {'id':band.id,'percent_discount':band.percent_discount,'approved_by_admin':False,'message':'Pendiente de revisión administrativa de los umbrales oficiales.'}

@router.get('/empresa/becas/{opportunity_id}/bandas')
def my_bands(opportunity_id:int,u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    owned_opportunity(db,u,opportunity_id)
    return [{'id':b.id,'percent_discount':b.percent_discount,'min_average':str(b.min_average),'min_math':str(b.min_math),'official_url':b.official_url,'approved_by_admin':b.approved_by_admin} for b in db.scalars(select(ScholarshipBand).where(ScholarshipBand.opportunity_id==opportunity_id)).all()]

class BandReview(BaseModel):
    approved:bool

@router.patch('/admin/becas/bandas/{band_id}/revisar')
def approve_band(band_id:int,body:BandReview,u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    b=db.get(ScholarshipBand,band_id)
    if not b:raise HTTPException(404,'Banda inexistente')
    b.approved_by_admin=body.approved and b.official_published
    db.add(AuditLog(actor_user_id=u.id,action='review_scholarship_band',target_type='scholarship_bands',target_id=str(b.id)))
    db.commit();return {'id':b.id,'approved_by_admin':b.approved_by_admin}

@router.get('/admin/becas/bandas/pendientes')
def pending_bands(u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    return [{'id':b.id,'opportunity_id':b.opportunity_id,'percent_discount':b.percent_discount,'official_url':b.official_url} for b in db.scalars(select(ScholarshipBand).where(ScholarshipBand.approved_by_admin.is_(False)).limit(100)).all()]

class CampaignIn(BaseModel):
    organization_id:int=Field(gt=0)
    title:str=Field(min_length=3,max_length=150)
    starts_on:date|None=None
    ends_on:date|None=None
    status:str=Field(default='draft',pattern='^(draft|active|paused|finished)$')
    sponsorship_disclosed:bool=True

@router.post('/empresa/campanas',status_code=201)
def create_campaign(body:CampaignIn,u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    my_org(db,u,body.organization_id)
    if not body.sponsorship_disclosed:raise HTTPException(422,'Debe identificarse el patrocinio de forma transparente')
    if body.starts_on and body.ends_on and body.ends_on<body.starts_on:raise HTTPException(422,'Fechas inválidas')
    r=InstitutionalCampaign(**body.model_dump());db.add(r);db.commit();db.refresh(r)
    return {'id':r.id,'title':r.title,'status':r.status,'patrocinado':True}

@router.get('/empresa/campanas')
def campaigns(u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    rows=db.scalars(select(InstitutionalCampaign).join(Organization,Organization.id==InstitutionalCampaign.organization_id).where(Organization.owner_user_id==u.id)).all()
    return [{'id':r.id,'organization_id':r.organization_id,'title':r.title,'status':r.status,'patrocinado':r.sponsorship_disclosed} for r in rows]

class AgreementIn(BaseModel):
    organization_id:int=Field(gt=0)
    course_id:int=Field(gt=0)
    commission_bob:Decimal=Field(ge=0,le=1000000,decimal_places=2)
    disclosed:bool=True

@router.post('/empresa/referidos/acuerdos',status_code=201)
def new_referral(body:AgreementIn,u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    my_org(db,u,body.organization_id)
    mapping=db.get(OrganizationCourse,(body.organization_id,body.course_id))
    if mapping is None:raise HTTPException(403,'El curso no pertenece a la organización')
    if not body.disclosed:raise HTTPException(422,'Las comisiones deben divulgarse')
    r=ReferralAgreement(**body.model_dump(),active=False);db.add(r);db.commit();db.refresh(r)
    return {'id':r.id,'active':False,'disclosed':True,'message':'Acuerdo registrado: necesita activación del administrador y no altera el matching.'}

@router.get('/empresa/referidos/acuerdos')
def agreements(u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    rows=db.scalars(select(ReferralAgreement).join(Organization,Organization.id==ReferralAgreement.organization_id).where(Organization.owner_user_id==u.id)).all()
    return [{'id':r.id,'course_id':r.course_id,'commission_bob':str(r.commission_bob),'disclosed':r.disclosed,'active':r.active} for r in rows]

class ApproveAgreement(BaseModel):
    active:bool

@router.patch('/admin/referidos/acuerdos/{agreement_id}')
def approve_agreement(agreement_id:int,body:ApproveAgreement,u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    r=db.get(ReferralAgreement,agreement_id)
    if not r:raise HTTPException(404,'Acuerdo inexistente')
    if body.active and not r.disclosed:raise HTTPException(422,'No puede activarse un acuerdo sin transparencia')
    r.active=body.active
    db.add(AuditLog(actor_user_id=u.id,action='review_referral_agreement',target_type='referral_agreements',target_id=str(r.id)))
    db.commit();return {'id':r.id,'active':r.active}

@router.post('/usuario/referidos/{agreement_id}/consentir',status_code=201)
def opt_in(agreement_id:int,u:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    r=db.get(ReferralAgreement,agreement_id)
    if not r or not r.active or not r.disclosed:raise HTTPException(404,'Acuerdo no disponible')
    account=db.get(StudentAccount,u.id)
    if not account or not account.profile_id:raise HTTPException(403,'Completa perfil universitario primero')
    enrollment=db.scalar(select(Enrollment).where(Enrollment.student_id==account.profile_id,Enrollment.course_id==r.course_id))
    if enrollment is None:raise HTTPException(409,'Primero debes inscribirte al curso')
    evt=db.scalar(select(ReferralEvent).where(ReferralEvent.agreement_id==r.id,ReferralEvent.student_user_id==u.id))
    if not evt:
        evt=ReferralEvent(agreement_id=r.id,student_user_id=u.id,completed=enrollment.completed);db.add(evt);db.commit()
    return {'consent':True,'course_id':r.course_id,'sponsored':True,'completed':evt.completed,'note':'La comisión no afecta elegibilidad ni prioridad.'}

@router.get('/empresa/estadisticas')
def stats(organization_id:int=Query(gt=0),u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    my_org(db,u,organization_id)
    opp_count=db.scalar(select(func.count()).select_from(OrganizationOpportunity).where(OrganizationOpportunity.organization_id==organization_id)) or 0
    courses=db.scalars(select(OrganizationCourse.course_id).where(OrganizationCourse.organization_id==organization_id)).all()
    completed=0
    if courses:
        completed=db.scalar(select(func.count()).select_from(Enrollment).where(Enrollment.course_id.in_(courses),Enrollment.completed.is_(True))) or 0
    # Evitar revelar recuentos pequeños de estudiantes identificables.
    return {'organization_id':organization_id,'opportunities_published':opp_count,'course_count':len(courses),'completed_enrollments':completed if completed>=5 else None,'privacy':'Recuentos de alumnos menores a cinco se suprimen; nunca se revelan finanzas individuales.'}

@router.get('/admin/resumen')
def admin_stats(u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    return {'users':db.scalar(select(func.count()).select_from(AppUser)),'organizations':db.scalar(select(func.count()).select_from(Organization)),'pending_verification':db.scalar(select(func.count()).select_from(Organization).where(Organization.verified.is_(False))),'opportunities':db.scalar(select(func.count()).select_from(Opportunity)),'courses':db.scalar(select(func.count()).select_from(Course))}

@router.get('/admin/auditoria')
def audit(limit:int=Query(default=50,ge=1,le=100),u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    return [{'id':a.id,'actor_user_id':a.actor_user_id,'action':a.action,'target_type':a.target_type,'target_id':a.target_id,'created_at':a.created_at} for a in db.scalars(select(AuditLog).order_by(AuditLog.id.desc()).limit(limit)).all()]

@router.get('/oportunidades/publicas')
def public_opportunities(limit:int=Query(default=50,ge=1,le=100),db:Session=Depends(get_db)):
    q=(select(Opportunity,Organization).join(OrganizationOpportunity,OrganizationOpportunity.opportunity_id==Opportunity.id).join(Organization,Organization.id==OrganizationOpportunity.organization_id).where(Organization.verified.is_(True),Opportunity.deadline>=date.today()).order_by(Opportunity.deadline,Opportunity.id).limit(limit))
    return [{'id':o.id,'title':o.title,'category':o.category,'deadline':o.deadline,'official_url':o.official_url,'amount_bob':o.amount_bob,'organization':org.name,'verified_organization':org.verified} for o,org in db.execute(q)]

@router.get('/cursos/publicos')
def public_courses(limit:int=Query(default=50,ge=1,le=100),db:Session=Depends(get_db)):
    q=(select(Course,Organization).join(OrganizationCourse,OrganizationCourse.course_id==Course.id).join(Organization,Organization.id==OrganizationCourse.organization_id).where(Organization.verified.is_(True),Course.end_date>=date.today()).order_by(Course.cost_bob,Course.end_date).limit(limit))
    results=[]
    for c,org in db.execute(q):
        sponsored=db.scalar(select(ReferralAgreement.id).where(ReferralAgreement.course_id==c.id,ReferralAgreement.active.is_(True),ReferralAgreement.disclosed.is_(True)).limit(1)) is not None
        results.append({'id':c.id,'title':c.title,'end_date':c.end_date,'cost_bob':c.cost_bob,'credential_kind':c.credential_kind,'credential_value':c.credential_value,'credential_level':c.credential_level,'organization':org.name,'sponsored':sponsored})
    return results

@router.get('/empresa/oportunidades')
def my_opportunities(u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    q=(select(Opportunity,Organization).join(OrganizationOpportunity,OrganizationOpportunity.opportunity_id==Opportunity.id).join(Organization,Organization.id==OrganizationOpportunity.organization_id).where(Organization.owner_user_id==u.id).order_by(Opportunity.deadline))
    return [{'id':o.id,'title':o.title,'organization_id':org.id,'deadline':o.deadline,'category':o.category,'official_url':o.official_url,'verified_organization':org.verified} for o,org in db.execute(q)]

@router.get('/empresa/cursos')
def my_courses(u:AppUser=Depends(require_role('empresa')),db:Session=Depends(get_db)):
    q=(select(Course,Organization).join(OrganizationCourse,OrganizationCourse.course_id==Course.id).join(Organization,Organization.id==OrganizationCourse.organization_id).where(Organization.owner_user_id==u.id).order_by(Course.end_date))
    return [{'id':c.id,'title':c.title,'organization_id':org.id,'end_date':c.end_date,'cost_bob':c.cost_bob,'credential_kind':c.credential_kind,'credential_value':c.credential_value} for c,org in db.execute(q)]

@router.get('/admin/organizaciones')
def admin_orgs(u:AppUser=Depends(require_role('admin')),db:Session=Depends(get_db)):
    return [{'id':o.id,'name':o.name,'owner_user_id':o.owner_user_id,'verified':o.verified} for o in db.scalars(select(Organization).order_by(Organization.id).limit(200)).all()]
