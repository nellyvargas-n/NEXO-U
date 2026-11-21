"""Crea cuentas ficticias explícitamente en Neon/SQLite, nunca al iniciar el servidor.

Uso: ALLOW_DEMO_SEED=true python -m scripts.seed_demo_accounts
      (después de ejecutar sql/NEON_CONSOLE_TODO.sql en Neon Console)
"""
from pathlib import Path
from datetime import date, timedelta
import json, os
from sqlalchemy import select
from app.core.database import SessionLocal
from app.core.auth_jwt import hash_password
from app.models.access import AppUser, Organization, StudentAccount, AuditLog
from app.models.entities import Profile, Credential, Opportunity, Requirement, Course
from app.models.extended import OrganizationOpportunity, OrganizationCourse

root=Path(__file__).resolve().parents[1]
if os.getenv('ALLOW_DEMO_SEED','').strip().lower()!='true':
    raise SystemExit('BLOQUEADO. Define ALLOW_DEMO_SEED=true solo si tu base es de PRUEBAS. Nunca en producción.')
with open(root/'credenciales'/'demo_accounts.json',encoding='utf-8') as handle:
    credentials=json.load(handle)

with SessionLocal() as db:
    for account in credentials['accounts']:
        user=db.scalar(select(AppUser).where(AppUser.email==account['email']))
        if user:
            print('EXISTE (sin cambiar contraseña):', account['email'])
            continue
        user=AppUser(email=account['email'],password_hash=hash_password(account['password']),role=account['role'],active=True)
        db.add(user);db.flush()
        if account['role']=='usuario':db.add(StudentAccount(user_id=user.id))
        print('CREADO:',account['email'],account['role'])
    db.commit()
    def get(email):return db.scalar(select(AppUser).where(AppUser.email==email))
    company=get('empresa@nexou.demo');student=get('estudiante@nexou.demo');admin=get('admin@nexou.demo')
    org=db.scalar(select(Organization).where(Organization.owner_user_id==company.id,Organization.name=='Academia Nexo DEMO'))
    if org is None:
        org=Organization(owner_user_id=company.id,name='Academia Nexo DEMO',verified=True)
        db.add(org);db.flush()
    account=db.get(StudentAccount,student.id)
    if account.profile_id is None:
        p=Profile(name='Camila — DEMOSTRACIÓN',career='Ingeniería de Sistemas',semester=6,age=21,city='La Paz')
        db.add(p);db.flush();account.profile_id=p.id
        db.add(Credential(student_id=p.id,kind='skill',value='Python',level=None,verified=False,issuer=None))
    opp=db.scalar(select(Opportunity).where(Opportunity.title=='Pasantía Sistemas — DEMO FICTICIA'))
    if opp is None:
        opp=Opportunity(title='Pasantía Sistemas — DEMO FICTICIA',category='pasantia',deadline=date.today()+timedelta(days=30),official_url='https://example.org/nexo-u-ejemplo-no-oficial',amount_bob=1500)
        db.add(opp);db.flush()
        db.add(OrganizationOpportunity(organization_id=org.id,opportunity_id=opp.id))
        for kind,operator,val in [('career','in','Ingeniería de Sistemas|Informática'),('semester','>=','5'),('age','between','18-25'),('skill','has','Python'),('language','B1','Inglés')]:
            db.add(Requirement(opportunity_id=opp.id,kind=kind,operator=operator,value=val,mandatory=True))
    course=db.scalar(select(Course).where(Course.title=='Inglés B1 — DEMO FICTICIO'))
    if course is None:
        course=Course(title='Inglés B1 — DEMO FICTICIO',end_date=date.today()+timedelta(days=14),cost_bob=0,credential_kind='language',credential_value='Inglés',credential_level='B1',issuer=org.name)
        db.add(course);db.flush()
        db.add(OrganizationCourse(organization_id=org.id,course_id=course.id))
    db.commit()
    print('\nDEMO LISTA: estudiante_user_id=',student.id,'organizacion_id=',org.id,'oportunidad_id=',opp.id,'curso_id=',course.id)
    print('Los datos de oportunidad/curso son ficticios; reemplázalos por fuentes oficiales para tu presentación.')
    print('1) Login estudiante -> GET /api/v1/usuario/match (4/5)')
    print('2) POST /api/v1/usuario/cursos/'+str(course.id)+'/inscribir')
    print('3) Login empresa -> POST /api/v1/empresa/cursos/'+str(course.id)+'/validar, student_user_id='+str(student.id))
    print('4) Login estudiante -> GET /api/v1/usuario/match (5/5)')
