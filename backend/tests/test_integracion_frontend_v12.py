"""Contrato React: universitarios, colegios, pertenencia a empresa y demo pública."""
from datetime import date, timedelta
from app.core.database import SessionLocal
from app.models.entities import Credential, Enrollment, Profile
from app.models.access import StudentAccount
from sqlalchemy import select
from tests.test_flow_completo import future, admin_token, company_setup


def new_course(client, comp, org, level='B1'):
    response=client.post('/api/v1/empresa/cursos',headers=comp,json={
        'organization_id':org,'title':'Curso académico de idioma', 'end_date':future(14),
        'cost_bob':0,'credential_kind':'language','credential_value':'Inglés','credential_level':level})
    assert response.status_code==201,response.text
    return response.json()['id']


def new_opportunity(client, comp, org, requirements, category='beca'):
    response=client.post('/api/v1/empresa/oportunidades',headers=comp,json={
        'organization_id':org,'title':'Oportunidad de integración', 'category':category,
        'deadline':future(30), 'official_url':'https://example.org/prueba-no-oficial', 'amount_bob':0})
    assert response.status_code==201,response.text
    oid=response.json()['id']
    for kind,operator,value in requirements:
        r=client.post(f'/api/v1/empresa/oportunidades/{oid}/requisitos',headers=comp,json={
            'kind':kind,'operator':operator,'value':value,'mandatory':True})
        assert r.status_code==201,r.text
    return oid


def school(client, register_login, name):
    user_id,headers=register_login()
    res=client.put('/api/v1/usuario/escolar/perfil',headers=headers,json={
        'full_name':name,'city':'La Paz','graduation_year':date.today().year,
        'average_grade':'90','math_grade':'85'})
    assert res.status_code==200,res.text
    return user_id,headers


def test_matching_includes_operator_and_level(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _,comp,org=company_setup(client,register_login,admin)
    _,student=register_login()
    assert client.put('/api/v1/usuario/perfil',headers=student,json={
        'name':'Universitario Uno','career':'Sistemas','semester':6,'age':22,'city':'La Paz'}).status_code==200
    oid=new_opportunity(client,comp,org,[('career','in','Sistemas'),('language','B1','Inglés')])
    r=client.get('/api/v1/usuario/match',headers=student)
    assert r.status_code==200,r.text
    result=next(item for item in r.json() if item['opportunity_id']==oid)
    assert result['met']==1 and result['total']==2
    assert result['requirements'][1]['operator']=='B1'
    assert result['requirements'][1]['required']=='Inglés'
    assert result['requirements'][1]['required_level']=='B1'
    assert result['profile_type']=='universitario'


def test_school_credentials_enrollments_matching_validation_and_isolation(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _,comp,org=company_setup(client,register_login,admin)
    sid,student=school(client,register_login,'Estudiante Escolar Uno')
    _,other=school(client,register_login,'Estudiante Escolar Dos')
    cid=new_course(client,comp,org)
    oid=new_opportunity(client,comp,org,[('average_grade','>=','85'),('math_grade','>=','80'),
         ('graduation_year','eq',str(date.today().year)),('language','B1','Inglés')])
    initial=client.get('/api/v1/usuario/match',headers=student)
    assert initial.status_code==200,initial.text
    result=next(m for m in initial.json() if m['opportunity_id']==oid)
    assert result['met']==3 and result['total']==4 and not result['eligible']
    assert result['requirements'][-1]['operator']=='B1'
    assert cid in [c['id'] for c in result['requirements'][-1]['courses']]
    assert result['profile_type']=='colegial'
    # Una pasantía universitaria no se marca como elegible solo por ser colegial.
    uid_university_opportunity=new_opportunity(client,comp,org,[('career','in','Ingeniería de Sistemas')],category='pasantia')
    incompatible=next(m for m in client.get('/api/v1/usuario/match',headers=student).json()
                      if m['opportunity_id']==uid_university_opportunity)
    assert not incompatible['eligible']
    assert incompatible['requirements'][0]['status']=='no_declarado'
    # Una credencial declarada escolar pertenece a una cuenta, no a un perfil universitario.
    posted=client.post('/api/v1/usuario/credenciales',headers=student,json={
        'kind':'skill','value':'Python'})
    assert posted.status_code==201,posted.text
    own_cred=posted.json()['id']
    assert any(c['id']==own_cred for c in client.get('/api/v1/usuario/credenciales',headers=student).json())
    assert all(c['id']!=own_cred for c in client.get('/api/v1/usuario/credenciales',headers=other).json())
    assert client.delete(f'/api/v1/usuario/credenciales/{own_cred}',headers=other).status_code==404
    assert client.post(f'/api/v1/usuario/cursos/{cid}/inscribir',headers=student).status_code==201
    assert client.get('/api/v1/usuario/inscripciones',headers=other).json()==[]
    assert client.get('/api/v1/usuario/inscripciones',headers=student).json()[0]['validation_status']=='pendiente'
    listing=client.get(f'/api/v1/empresa/cursos/{cid}/inscripciones',headers=comp)
    assert listing.status_code==200,listing.text
    assert listing.json()[0]['student_user_id']==sid
    assert listing.json()[0]['student_name']=='Estudiante Escolar Uno'
    assert listing.json()[0]['profile_type']=='colegial'
    assert listing.json()[0]['validation_status']=='pendiente'
    validated=client.post(f'/api/v1/empresa/cursos/{cid}/validar',headers=comp,json={'student_user_id':sid})
    assert validated.status_code==200,validated.text
    result=next(m for m in client.get('/api/v1/usuario/match',headers=student).json() if m['opportunity_id']==oid)
    assert result['eligible'] and result['met']==4
    assert any(c['verified'] and c['level']=='B1' for c in client.get('/api/v1/usuario/credenciales',headers=student).json())
    assert all(not c['verified'] for c in client.get('/api/v1/usuario/credenciales',headers=other).json())
    assert client.get('/api/v1/usuario/inscripciones',headers=student).json()[0]['validation_status']=='validado'
    assert client.get('/api/v1/usuario/dashboard',headers=student).json()['credential_count']==2
    with SessionLocal() as db:
        assert db.scalar(select(Enrollment).where(Enrollment.student_user_id==sid,Enrollment.student_id.is_(None))) is not None
        assert db.scalar(select(Credential).where(Credential.student_user_id==sid,Credential.student_id.is_(None))) is not None


def test_company_course_roster_restricted_to_owner(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _,owner,org=company_setup(client,register_login,admin)
    _,other_comp,other_org=company_setup(client,register_login,admin)
    sid,student=school(client,register_login,'Inscrito Protegido')
    cid=new_course(client,owner,org,level='B2')
    assert client.post(f'/api/v1/usuario/cursos/{cid}/inscribir',headers=student).status_code==201
    mine=client.get('/api/v1/empresa/cursos',headers=owner)
    assert mine.status_code==200 and next(c for c in mine.json() if c['id']==cid)['credential_level']=='B2'
    assert client.get(f'/api/v1/empresa/cursos/{cid}/inscripciones',headers=other_comp).status_code==404
    assert client.get(f'/api/v1/empresa/cursos/{cid}/inscripciones',headers=student).status_code==403
    assert client.get(f'/api/v1/empresa/cursos/{cid}/inscripciones').status_code==401
    assert client.get(f'/api/v1/empresa/cursos/{cid}/inscripciones',headers=owner).json()[0]['student_user_id']==sid


def test_public_opportunities_verified_current_only(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _,comp,org=company_setup(client,register_login,admin)
    oid=new_opportunity(client,comp,org,[('average_grade','>=','80')])
    listing=client.get('/api/v1/oportunidades/publicas')
    assert listing.status_code==200,listing.text
    own=next(o for o in listing.json() if o['id']==oid)
    assert own['verified_organization'] and own['is_demo'] is False
    # Sin verificación no debe aparecer en el catálogo público.
    assert client.patch(f'/api/v1/admin/organizaciones/{org}/verificacion',headers=admin,json={'verified':False}).status_code==200
    assert oid not in [o['id'] for o in client.get('/api/v1/oportunidades/publicas').json()]


def test_legacy_university_credential_and_enrollment_remain_readable(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _,company,org=company_setup(client,register_login,admin)
    uid,student=register_login()
    created=client.put('/api/v1/usuario/perfil',headers=student,json={
        'name':'Universitario Legado','career':'Ingeniería','semester':4,'age':22,'city':'La Paz'})
    pid=created.json()['id']
    cid=new_course(client,company,org)
    with SessionLocal() as db:
        credential=Credential(student_id=pid,student_user_id=None,kind='certificate',value='Legado',verified=False)
        enrollment=Enrollment(student_id=pid,student_user_id=None,course_id=cid,completed=False)
        db.add_all([credential,enrollment]);db.commit(); db.refresh(credential);db.refresh(enrollment)
        credential_id=credential.id; enrollment_id=enrollment.id
    assert credential_id in [c['id'] for c in client.get('/api/v1/usuario/credenciales',headers=student).json()]
    assert enrollment_id in [e['id'] for e in client.get('/api/v1/usuario/inscripciones',headers=student).json()]
    assert client.post(f'/api/v1/usuario/cursos/{cid}/inscribir',headers=student).json()['id']==enrollment_id
    assert client.get(f'/api/v1/empresa/cursos/{cid}/inscripciones',headers=company).json()[0]['student_user_id']==uid


def test_school_requirement_validation(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _,company,org=company_setup(client,register_login,admin)
    oid=new_opportunity(client,company,org,[('graduation_year','eq',str(date.today().year))])
    assert client.post(f'/api/v1/empresa/oportunidades/{oid}/requisitos',headers=company,json={
        'kind':'average_grade','operator':'>=','value':'101'}).status_code==422
    assert client.post(f'/api/v1/empresa/oportunidades/{oid}/requisitos',headers=company,json={
        'kind':'graduation_year','operator':'eq','value':'abc'}).status_code==422
