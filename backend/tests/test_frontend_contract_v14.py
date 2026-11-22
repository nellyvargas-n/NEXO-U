"""Contrato JSON que React espera (probado con base temporal, no Neon real)."""
from datetime import date, timedelta


def test_public_meta_and_ready_for_react(client):
    ready=client.get('/ready')
    assert ready.status_code==200
    assert ready.json()=={'status':'ready','database':'connected','schema':'v1.4'}
    meta=client.get('/api/v1/meta')
    assert meta.status_code==200
    assert meta.json()['roles']==['usuario','empresa','admin']
    assert meta.json()['api_version']=='1.4.0'


def test_student_dashboard_and_public_empty_catalog_contract(client,register_login):
    _,student=register_login()
    dash=client.get('/api/v1/usuario/dashboard',headers=student)
    assert dash.status_code==200
    assert dash.json()['profile_type']=='pendiente'
    assert 'matches' in dash.json()
    public=client.get('/api/v1/oportunidades/publicas')
    assert public.status_code==200 and isinstance(public.json(),list)


def test_public_company_course_exposes_credential_level(client,register_login,make_admin):
    _,company=register_login('empresa')
    name,password=make_admin()
    login=client.post('/api/v1/auth/login',json={'email':name,'password':password})
    admin={'Authorization':'Bearer '+login.json()['access_token']}
    org=client.post('/api/v1/empresa/organizaciones',json={'name':'Academia pruebas web'},headers=company).json()['id']
    assert client.patch(f'/api/v1/admin/organizaciones/{org}/verificacion',headers=admin,json={'verified':True}).status_code==200
    date_end=(date.today()+timedelta(days=21)).isoformat()
    course=client.post('/api/v1/empresa/cursos',headers=company,json={
       'organization_id':org,'title':'Inglés intermedio de muestra','end_date':date_end,
       'cost_bob':0,'credential_kind':'language','credential_value':'Inglés','credential_level':'B1'})
    assert course.status_code==201
    owned=client.get('/api/v1/empresa/cursos',headers=company).json()
    assert any(c['id']==course.json()['id'] and c['credential_level']=='B1' for c in owned)
    catalog=client.get('/api/v1/cursos/publicos').json()
    assert any(c['id']==course.json()['id'] and c['credential_level']=='B1' for c in catalog)
