"""Cobertura añadida en v1.1: contrato React, rutas, seguridad y errores de matching."""
from datetime import date,timedelta
from tests.test_flow_completo import admin_token, company_setup

def future(days=20): return (date.today()+timedelta(days=days)).isoformat()

def test_root_docs_readme_health_meta(client):
    assert client.get('/').status_code==200
    assert 'NEXO U' in client.get('/').text
    assert client.get('/docs').status_code==200
    assert client.get('/README.md').status_code==200
    assert client.get('/readme').status_code==200
    assert client.get('/health').json()['status']=='ok'
    meta=client.get('/api/v1/meta')
    assert meta.status_code==200
    assert set(meta.json()['roles'])=={'usuario','empresa','admin'}
    assert meta.json()['auth']['scheme']=='Bearer JWT'

def test_cors_from_vite(client):
    r=client.options('/api/v1/auth/login',headers={'Origin':'http://localhost:5173','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type'})
    assert r.status_code==200,r.text
    assert r.headers.get('access-control-allow-origin')=='http://localhost:5173'

def test_frontend_dashboard_role_isolation(client,register_login,make_admin):
    _,student=register_login('usuario')
    _,company=register_login('empresa')
    admin=admin_token(client,make_admin)
    assert client.get('/api/v1/usuario/dashboard',headers=student).json()['profile_type']=='pendiente'
    assert client.get('/api/v1/empresa/dashboard',headers=company).json()['organizations']==[]
    assert client.get('/api/v1/admin/dashboard',headers=admin).json()['role']=='admin'
    assert client.get('/api/v1/usuario/dashboard',headers=company).status_code==403
    assert client.get('/api/v1/empresa/dashboard',headers=student).status_code==403
    assert client.get('/api/v1/admin/dashboard',headers=student).status_code==403
    assert client.get('/api/v1/admin/dashboard').status_code==401

def test_change_password_revokes_previous_jwt(client,register_login):
    user,token=register_login('usuario')
    original_token=token['Authorization']
    from app.core.database import SessionLocal
    from app.models.access import AppUser
    with SessionLocal() as db:
        email=db.get(AppUser,user).email
    wrong=client.post('/api/v1/auth/cambiar-clave',headers=token,json={'current_password':'wrong','new_password':'NewVeryStrongPassword987!'})
    assert wrong.status_code==400
    r=client.post('/api/v1/auth/cambiar-clave',headers=token,json={'current_password':'SuperSafePassword123!','new_password':'NewVeryStrongPassword987!'})
    assert r.status_code==200,r.text
    assert client.get('/api/v1/auth/me',headers={'Authorization':original_token}).status_code==401
    assert client.post('/api/v1/auth/login',json={'email':email,'password':'SuperSafePassword123!'}).status_code==401
    login=client.post('/api/v1/auth/login',json={'email':email,'password':'NewVeryStrongPassword987!'})
    assert login.status_code==200,login.text
    assert client.get('/api/v1/auth/me',headers={'Authorization':'Bearer '+login.json()['access_token']}).status_code==200

def test_requirements_validation_and_empty_opportunity(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _,company,org=company_setup(client,register_login,admin)
    _,student=register_login('usuario')
    assert client.put('/api/v1/usuario/perfil',headers=student,json={'name':'Camila Demo','career':'Sistemas','semester':6,'age':21,'city':'La Paz'}).status_code==200
    response=client.post('/api/v1/empresa/oportunidades',headers=company,json={'organization_id':org,'title':'Pasantía sin requisitos','category':'pasantia','deadline':future(30),'official_url':'https://example.org/opportunity','amount_bob':0})
    assert response.status_code==201,response.text
    oid=response.json()['id']
    matches=client.get('/api/v1/usuario/match',headers=student).json()
    assert all(m['opportunity_id']!=oid for m in matches), 'No marcar oportunidades vacías como 100% elegibles'
    bad_rules=[{'kind':'semester','operator':'>=','value':'abc','mandatory':True},
               {'kind':'age','operator':'between','value':'21-18','mandatory':True},
               {'kind':'language','operator':'Z7','value':'Inglés','mandatory':True},
               {'kind':'career','operator':'in','value':'Sistemas|  ','mandatory':True}]
    for body in bad_rules:
        r=client.post(f'/api/v1/empresa/oportunidades/{oid}/requisitos',json=body,headers=company)
        assert r.status_code==422,r.text
    assert client.post(f'/api/v1/empresa/oportunidades/{oid}/requisitos',json={'kind':'semester','operator':'>=','value':'5','mandatory':True},headers=company).status_code==201
    m=client.get('/api/v1/usuario/match',headers=student).json()
    assert next(x for x in m if x['opportunity_id']==oid)['eligible']

def test_user_credential_cannot_be_deleted_by_other_student(client,register_login):
    _,a=register_login('usuario'); _,b=register_login('usuario')
    for h in (a,b):
        assert client.put('/api/v1/usuario/perfil',headers=h,json={'name':'Estudiante Demo','career':'Sistemas','semester':2,'age':20,'city':'La Paz'}).status_code==200
    credential=client.post('/api/v1/usuario/credenciales',headers=a,json={'kind':'skill','value':'Git'}).json()
    cid=credential['id']
    assert client.delete(f'/api/v1/usuario/credenciales/{cid}',headers=b).status_code==404
    assert client.delete(f'/api/v1/usuario/credenciales/{cid}',headers=a).status_code==200
    assert client.delete(f'/api/v1/usuario/credenciales/{cid}',headers=a).status_code==404


def test_env_alias_and_jwt_readiness(client,monkeypatch):
    from app.core.config import Settings,settings
    assert Settings(ACCESS_TOKEN_EXPIRE_MINUTES=60).jwt_exp_minutes == 60
    monkeypatch.setattr(settings,'jwt_secret','clave_de_prueba_corta')
    r=client.get('/ready')
    assert r.status_code==503
    assert 'JWT_SECRET' in r.json()['detail']
