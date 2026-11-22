"""Poblar únicamente una base DE PRUEBAS; las claves se generan al ejecutarlo.

Uso: ALLOW_DEMO_SEED=true python -m scripts.seed_demo_accounts
Opcional: --rotate-demo para restablecer solo cuentas @nexou.demo explícitamente.
Se imprimen claves nuevas una sola vez y se guardan fuera de Git.
"""
from pathlib import Path
from datetime import date, timedelta
import os, sys, secrets
from sqlalchemy import select
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.auth_jwt import hash_password
from app.models.access import AppUser, Organization, StudentAccount
from app.models.entities import Profile, Credential, Opportunity, Requirement, Course
from app.models.extended import OrganizationOpportunity, OrganizationCourse, SchoolProfile

if os.getenv('ALLOW_DEMO_SEED', '').lower() != 'true':
    raise SystemExit('BLOQUEADO: define ALLOW_DEMO_SEED=true solo en una base de pruebas')
if settings.environment == 'production':
    raise SystemExit('BLOQUEADO: no sembrar cuentas de demostración en producción')
rotate = '--rotate-demo' in sys.argv
specs = [('usuario', 'estudiante@nexou.demo'), ('empresa', 'empresa@nexou.demo'),
         ('admin', 'admin@nexou.demo'), ('usuario', 'colegial@nexou.demo')]
created_credentials = []
with SessionLocal() as db:
    for role, email in specs:
        u = db.scalar(select(AppUser).where(AppUser.email == email))
        if u and u.role != role:
            raise SystemExit(f'CONFLICTO: {email} existe con un rol distinto; no se altera')
        if not u or rotate:
            password = secrets.token_urlsafe(24)
            if not u:
                u = AppUser(email=email, role=role, password_hash=hash_password(password), active=True)
                db.add(u)
                db.flush()
                if role == 'usuario':
                    db.add(StudentAccount(user_id=u.id))
            else:
                u.password_hash = hash_password(password)
                u.token_version += 1
            created_credentials.append((role, email, password))
    db.commit()

    def by_email(email):
        return db.scalar(select(AppUser).where(AppUser.email == email))

    company = by_email('empresa@nexou.demo')
    student = by_email('estudiante@nexou.demo')
    school_user = by_email('colegial@nexou.demo')
    org = db.scalar(select(Organization).where(Organization.owner_user_id == company.id))
    if org is None:
        org = Organization(owner_user_id=company.id, name='Academia Nexo U', verified=True)
        db.add(org)
        db.flush()
    else:
        org.name = 'Academia Nexo U'
        org.verified = True
    account = db.get(StudentAccount, student.id)
    if account is None:
        account = StudentAccount(user_id=student.id)
        db.add(account)
    if not account.profile_id:
        p = Profile(name='Camila Rojas', career='Ingeniería de Sistemas',
                    semester=6, age=21, city='La Paz')
        db.add(p)
        db.flush()
        account.profile_id = p.id
        db.add(Credential(student_id=p.id, student_user_id=student.id, kind='skill', value='Python', level=None,
                          verified=False, issuer=None))
    elif db.get(Profile, account.profile_id).name.endswith(('DEMO', 'DEMOSTRACIÓN')):
        db.get(Profile, account.profile_id).name = 'Camila Rojas'
    if db.get(SchoolProfile, school_user.id) is None:
        db.add(SchoolProfile(user_id=school_user.id,full_name='Alex Mendoza',
                             city='La Paz',graduation_year=date.today().year,
                             average_grade=90,math_grade=85))
    else:
        school_profile = db.get(SchoolProfile, school_user.id)
        if 'FICTICIO' in school_profile.full_name.upper() or 'DEMO' in school_profile.full_name.upper():
            school_profile.full_name = 'Alex Mendoza'
    opp_title = 'Pasantía en Sistemas'
    opp = db.scalar(select(Opportunity).where(Opportunity.title.in_([opp_title, 'Pasantía Sistemas — DEMO FICTICIA'])))
    if opp is None:
        opp = Opportunity(title=opp_title, category='pasantia',
                          deadline=date.today() + timedelta(days=30),is_demo=True,
                          official_url='', amount_bob=1500)
        db.add(opp)
        db.flush()
        db.add(OrganizationOpportunity(organization_id=org.id, opportunity_id=opp.id))
        for kind, operator, value in [
            ('career', 'in', 'Ingeniería de Sistemas|Informática'), ('semester', '>=', '5'),
            ('age', 'between', '18-25'), ('skill', 'has', 'Python'), ('language', 'B1', 'Inglés')]:
            db.add(Requirement(opportunity_id=opp.id, kind=kind, operator=operator, value=value,
                               mandatory=True))
    else:
        opp.title = opp_title
        opp.official_url = ''
        opp.is_demo=True
        if opp.deadline < date.today(): opp.deadline=date.today()+timedelta(days=30)
    school_title = 'Beca por rendimiento escolar'
    school_opp=db.scalar(select(Opportunity).where(Opportunity.title.in_([school_title,'Beca escolar — DEMO FICTICIA'])))
    if school_opp is None:
        school_opp=Opportunity(title=school_title,category='beca',
                               deadline=date.today()+timedelta(days=30),is_demo=True,
                               official_url='',amount_bob=0)
        db.add(school_opp);db.flush()
        db.add(OrganizationOpportunity(organization_id=org.id,opportunity_id=school_opp.id))
        for kind,operator,value in [('average_grade','>=','85'),('math_grade','>=','80'),
                                    ('graduation_year','eq',str(date.today().year)),('language','B1','Inglés')]:
            db.add(Requirement(opportunity_id=school_opp.id,kind=kind,operator=operator,value=value,mandatory=True))
    else:
        school_opp.title = school_title
        school_opp.official_url = ''
        school_opp.is_demo=True
        if school_opp.deadline < date.today(): school_opp.deadline=date.today()+timedelta(days=30)
    course_title = 'Inglés B1: fundamentos del idioma'
    course = db.scalar(select(Course).where(Course.title.in_([course_title,'Inglés B1 — DEMO FICTICIO'])))
    if course is None:
        course = Course(title=course_title, end_date=date.today() + timedelta(days=14),
                        cost_bob=0, credential_kind='language', credential_value='Inglés',
                        credential_level='B1', issuer=org.name)
        db.add(course)
        db.flush()
        db.add(OrganizationCourse(organization_id=org.id, course_id=course.id))
    else:
        course.title = course_title
        if course.end_date < date.today(): course.end_date=date.today()+timedelta(days=14)
    db.flush()  # persistir asociaciones nuevas antes de comprobar si ya existen
    for op in (opp,school_opp):
        if db.get(OrganizationOpportunity,(org.id,op.id)) is None:
            db.add(OrganizationOpportunity(organization_id=org.id,opportunity_id=op.id))
    if db.get(OrganizationCourse,(org.id,course.id)) is None:
        db.add(OrganizationCourse(organization_id=org.id,course_id=course.id))
    db.commit()

print('Datos de demostración preparados. La pasantía y el curso NO son convocatorias reales.')
print('IDs: estudiante=', student.id, 'empresa=', company.id, 'oportunidad=', opp.id, 'curso=', course.id)
if created_credentials:
    lines = ['# Credenciales locales de NEXO U — SOLO PRUEBAS',
             '', 'NO subir este archivo a GitHub ni usar en producción.', '',
             '| Rol | Correo | Contraseña temporal |', '|---|---|---|']
    lines.extend(f'| {role} | {email} | `{password}` |' for role, email, password in created_credentials)
    content = '\n'.join(lines) + '\n'
    secret_dir = Path(__file__).resolve().parents[1] / '.local_credentials'
    secret_dir.mkdir(mode=0o700, exist_ok=True)
    output = secret_dir / 'CREDENCIALES_GENERADAS.md'
    output.write_text(content, encoding='utf-8')
    try: output.chmod(0o600)
    except OSError: pass
    print('\n' + content)
    print('Copia privada guardada en el contenedor:', output)
else:
    print('Las cuentas ya existían: NO se cambiaron sus contraseñas.')
    print('Si perdiste las claves DEMO, ejecuta este comando nuevamente con --rotate-demo (solo en pruebas).')
