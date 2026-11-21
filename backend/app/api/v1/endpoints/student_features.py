"""Billetera de estudiante: secundaria/universidad, finanzas personales y guardados."""
from datetime import date, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func, delete, text as sql_text
from sqlalchemy.orm import Session
from app.core.auth_jwt import require_role
from app.core.database import get_db
from app.models.access import AppUser, StudentAccount
from app.models.entities import Profile, Opportunity, Credential, Enrollment, Transaction
from app.models.extended import (SchoolProfile, ScholarshipBand, FinanceEntry, FinanceBudget,
    FinanceObligation, SavedOpportunity, Notification)

router=APIRouter(tags=['Estudiante - módulos ampliados'])

def as_money(d): return str(Decimal(d).quantize(Decimal('0.01')))

def adult_profile(db,user):
    account=db.get(StudentAccount,user.id)
    profile=db.get(Profile,account.profile_id) if account and account.profile_id else None
    if profile is None or profile.age < 18 or db.get(SchoolProfile,user.id) is not None:
        raise HTTPException(403,'Finanzas solo para universitarios adultos con perfil completo')
    # Contexto para las políticas RLS FORCE de Neon: válido solo en esta transacción.
    if db.bind.dialect.name == 'postgresql':
        db.execute(sql_text("SELECT set_config('nexou.user_id', :uid, true)"), {'uid':str(user.id)})
    return profile

class SchoolIn(BaseModel):
    full_name:str=Field(min_length=2,max_length=120)
    city:str=Field(min_length=2,max_length=120)
    graduation_year:int=Field(ge=2020,le=2100)
    average_grade:Decimal=Field(ge=0,le=100,decimal_places=2)
    math_grade:Decimal=Field(ge=0,le=100,decimal_places=2)

@router.put('/usuario/escolar/perfil')
def save_school(body:SchoolIn,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    acc=db.get(StudentAccount,user.id)
    if acc and acc.profile_id:raise HTTPException(409,'Ya tienes perfil universitario; no se mezclan perfiles educativos')
    s=db.get(SchoolProfile,user.id)
    if s is None:
        s=SchoolProfile(user_id=user.id,**body.model_dump());db.add(s)
    else:
        for k,v in body.model_dump().items():setattr(s,k,v)
    db.commit()
    return {'user_id':user.id,**{k:(as_money(v) if isinstance(v,Decimal) else v) for k,v in body.model_dump().items()}}

@router.get('/usuario/escolar/perfil')
def school(user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    s=db.get(SchoolProfile,user.id)
    if s is None:raise HTTPException(404,'Perfil escolar no registrado')
    return {'user_id':s.user_id,'full_name':s.full_name,'city':s.city,'graduation_year':s.graduation_year,'average_grade':as_money(s.average_grade),'math_grade':as_money(s.math_grade)}

@router.get('/usuario/becas/{opportunity_id}/simular')
def simulate_scholarship(opportunity_id:int,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    s=db.get(SchoolProfile,user.id)
    if s is None:raise HTTPException(403,'Esta simulación requiere un perfil escolar')
    opp=db.get(Opportunity,opportunity_id)
    if opp is None:raise HTTPException(404,'Oportunidad no encontrada')
    if opp.category.casefold() not in ('beca','scholarship'):
        raise HTTPException(422,'La oportunidad no es una beca')
    bands=db.scalars(select(ScholarshipBand).where(ScholarshipBand.opportunity_id==opportunity_id,ScholarshipBand.official_published.is_(True),ScholarshipBand.approved_by_admin.is_(True)).order_by(ScholarshipBand.percent_discount.desc())).all()
    if not bands:
        return {'status':'sin_estimacion','discount_percent':None,'message':'No hay umbrales oficiales completos y aprobados: no se inventa un porcentaje.'}
    matched=next((b for b in bands if s.average_grade >= b.min_average and s.math_grade >= b.min_math),None)
    return {'status':'compatible' if matched else 'no_compatible','discount_percent':matched.percent_discount if matched else None,'message':'Estimación orientativa; la institución decide y verifica documentos. No garantiza una beca.','criteria':[{'discount_percent':b.percent_discount,'minimum_average':as_money(b.min_average),'minimum_math':as_money(b.min_math),'meets':bool(s.average_grade >= b.min_average and s.math_grade >= b.min_math),'official_url':b.official_url} for b in bands]}

@router.put('/usuario/guardados/{opportunity_id}')
def save_opportunity(opportunity_id:int,remind_on:date|None=None,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    if db.get(Opportunity,opportunity_id) is None:raise HTTPException(404,'Oportunidad no encontrada')
    row=db.get(SavedOpportunity,(user.id,opportunity_id))
    if row is None:row=SavedOpportunity(user_id=user.id,opportunity_id=opportunity_id);db.add(row)
    row.remind_on=remind_on
    db.commit()
    return {'saved':True,'opportunity_id':opportunity_id,'remind_on':remind_on}

@router.get('/usuario/guardados')
def list_saved(user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    q=select(SavedOpportunity,Opportunity).join(Opportunity,Opportunity.id==SavedOpportunity.opportunity_id).where(SavedOpportunity.user_id==user.id).order_by(Opportunity.deadline)
    return [{'opportunity_id':o.id,'title':o.title,'deadline':o.deadline,'remind_on':s.remind_on} for s,o in db.execute(q)]

@router.delete('/usuario/guardados/{opportunity_id}')
def unsave(opportunity_id:int,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    row=db.get(SavedOpportunity,(user.id,opportunity_id))
    if row is None:raise HTTPException(404,'No está guardado')
    db.delete(row);db.commit();return {'deleted':True}

class EntryIn(BaseModel):
    direction:str=Field(pattern='^(income|expense)$')
    amount_bob:Decimal=Field(gt=0,le=100000000,decimal_places=2)
    category:str=Field(min_length=1,max_length=80)
    happened_on:date

@router.post('/usuario/finanzas/movimientos',status_code=201)
def create_entry(body:EntryIn,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    row=FinanceEntry(user_id=user.id,**body.model_dump());db.add(row);db.flush()
    result={'id':row.id,'direction':row.direction,'amount_bob':as_money(row.amount_bob),'category':row.category,'happened_on':row.happened_on}
    db.commit();return result

@router.get('/usuario/finanzas/movimientos')
def get_entries(limit:int=Query(default=50,ge=1,le=100),offset:int=Query(default=0,ge=0),user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    rows=db.scalars(select(FinanceEntry).where(FinanceEntry.user_id==user.id).order_by(FinanceEntry.happened_on.desc(),FinanceEntry.id.desc()).offset(offset).limit(limit)).all()
    return [{'id':r.id,'direction':r.direction,'amount_bob':as_money(r.amount_bob),'category':r.category,'happened_on':r.happened_on} for r in rows]

@router.delete('/usuario/finanzas/movimientos/{entry_id}')
def delete_entry(entry_id:int,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    r=db.get(FinanceEntry,entry_id)
    if not r or r.user_id!=user.id:raise HTTPException(404,'Movimiento no encontrado')
    db.delete(r);db.commit();return {'deleted':True}

class BudgetIn(BaseModel):
    category:str=Field(min_length=1,max_length=80)
    month:str=Field(pattern=r'^\d{4}-(0[1-9]|1[0-2])$')
    limit_bob:Decimal=Field(ge=0,le=100000000,decimal_places=2)

@router.put('/usuario/finanzas/presupuestos')
def upsert_budget(body:BudgetIn,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    row=db.scalar(select(FinanceBudget).where(FinanceBudget.user_id==user.id,FinanceBudget.category==body.category,FinanceBudget.month==body.month))
    if row is None:row=FinanceBudget(user_id=user.id,**body.model_dump());db.add(row)
    else:row.limit_bob=body.limit_bob
    db.commit()
    return {'id':row.id,'category':row.category,'month':row.month,'limit_bob':as_money(row.limit_bob)}

@router.get('/usuario/finanzas/presupuestos')
def budgets(user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    rows=db.scalars(select(FinanceBudget).where(FinanceBudget.user_id==user.id)).all()
    return [{'id':r.id,'category':r.category,'month':r.month,'limit_bob':as_money(r.limit_bob)} for r in rows]

class ObligationIn(BaseModel):
    title:str=Field(min_length=2,max_length=120)
    amount_bob:Decimal=Field(ge=0,le=100000000,decimal_places=2)
    due_on:date

@router.post('/usuario/finanzas/obligaciones',status_code=201)
def create_obligation(body:ObligationIn,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    row=FinanceObligation(user_id=user.id,**body.model_dump());db.add(row);db.commit();db.refresh(row)
    return {'id':row.id,'title':row.title,'amount_bob':as_money(row.amount_bob),'due_on':row.due_on,'paid':row.paid}

@router.get('/usuario/finanzas/obligaciones')
def obligations(user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    return [{'id':r.id,'title':r.title,'amount_bob':as_money(r.amount_bob),'due_on':r.due_on,'paid':r.paid} for r in db.scalars(select(FinanceObligation).where(FinanceObligation.user_id==user.id).order_by(FinanceObligation.due_on)).all()]

@router.patch('/usuario/finanzas/obligaciones/{obligation_id}/pagada')
def pay_obligation(obligation_id:int,user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    r=db.get(FinanceObligation,obligation_id)
    if not r or r.user_id!=user.id:raise HTTPException(404,'Obligación no encontrada')
    r.paid=True;db.commit();return {'id':r.id,'paid':True}

@router.get('/usuario/finanzas/resumen')
def finance_summary(daily_expense:Decimal=Query(default=Decimal('30'),ge=0,le=100000),reserve:Decimal=Query(default=Decimal('0'),ge=0,le=100000000),user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    adult_profile(db,user)
    entries=db.scalars(select(FinanceEntry).where(FinanceEntry.user_id==user.id)).all()
    income=sum((r.amount_bob for r in entries if r.direction=='income'),Decimal('0'))
    expense=sum((r.amount_bob for r in entries if r.direction=='expense'),Decimal('0'))
    balance=income-expense
    pending=db.scalars(select(FinanceObligation).where(FinanceObligation.user_id==user.id,FinanceObligation.paid.is_(False))).all()
    days=None;until=None
    if daily_expense>0:
        max_days=365
        projected=balance
        for i in range(max_days+1):
            day=date.today()+timedelta(days=i)
            projected-=sum((r.amount_bob for r in pending if r.due_on==day),Decimal('0'))
            if projected<reserve:break
            days=i;until=day.isoformat()
            projected-=daily_expense
    return {'balance_bob':as_money(balance),'income_bob':as_money(income),'expense_bob':as_money(expense),'pending_obligations_bob':as_money(sum((r.amount_bob for r in pending),Decimal('0'))),'estimated_days':days,'estimated_until':until,'note':'Estimación ilustrativa con gasto diario declarado; no es una decisión de crédito ni se comparte con empresas.'}

@router.delete('/usuario/billetera')
def reset_my_wallet(user:AppUser=Depends(require_role('usuario')),db:Session=Depends(get_db)):
    acc=db.get(StudentAccount,user.id)
    if acc and acc.profile_id:
        db.execute(delete(Transaction).where(Transaction.student_id==acc.profile_id))
        db.execute(delete(Enrollment).where(Enrollment.student_id==acc.profile_id))
        db.execute(delete(Credential).where(Credential.student_id==acc.profile_id))
        p=db.get(Profile,acc.profile_id)
        acc.profile_id=None;db.flush()
        if p:db.delete(p)
    if db.bind.dialect.name=='postgresql':
        db.execute(sql_text("SELECT set_config('nexou.user_id', :uid, true)"), {'uid':str(user.id)})
    for model in (SchoolProfile,FinanceEntry,FinanceBudget,FinanceObligation,SavedOpportunity,Notification):
        db.execute(delete(model).where((model.user_id if model is not SchoolProfile else model.user_id)==user.id))
    db.commit()
    return {'status':'billetera_borrada','cuenta_conservada':True}
