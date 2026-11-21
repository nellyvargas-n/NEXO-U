"""Pruebas end-to-end sin Neon real: permisos, match, finanzas, becas, eventos, comunidad."""
from datetime import date,timedelta,datetime,timezone

def future(days=30):return (date.today()+timedelta(days=days)).isoformat()

def admin_token(client,make_admin):
    email,password=make_admin()
    r=client.post('/api/v1/auth/login',json={'email':email,'password':password})
    assert r.status_code==200,r.text
    return {'Authorization':'Bearer '+r.json()['access_token']}

def company_setup(client,register_login,admin_headers):
    company_id, company_headers=register_login('empresa')
    r=client.post('/api/v1/empresa/organizaciones',json={'name':'Universidad Ejemplo'},headers=company_headers)
    assert r.status_code==201,r.text
    oid=r.json()['id']
    assert client.post('/api/v1/empresa/oportunidades',headers=company_headers,json={'organization_id':oid,'title':'No se permite antes de verificar','category':'pasantia','deadline':future(30),'official_url':'https://example.org','amount_bob':100}).status_code==403
    r=client.patch(f'/api/v1/admin/organizaciones/{oid}/verificacion',json={'verified':True},headers=admin_headers)
    assert r.status_code==200,r.text
    return company_id,company_headers,oid

def test_auth_three_roles_and_admin_protection(client,register_login,make_admin):
    student_id, student_headers=register_login('usuario')
    comp_id,comp_headers=register_login('empresa')
    admin_headers=admin_token(client,make_admin)
    assert client.get('/api/v1/auth/me',headers=student_headers).json()['role']=='usuario'
    assert client.get('/api/v1/auth/me',headers=comp_headers).json()['role']=='empresa'
    assert client.get('/api/v1/auth/me',headers=admin_headers).json()['role']=='admin'
    assert client.get('/api/v1/admin/usuarios',headers=student_headers).status_code==403
    assert client.get('/api/v1/empresa/organizaciones',headers=student_headers).status_code==403
    assert client.get('/api/v1/usuario/panel',headers=comp_headers).status_code==403
    assert client.post('/api/v1/auth/register',json={'email':'fakeadmin@example.com','password':'SafePassword1234!','role':'admin'}).status_code==422
    assert client.get('/api/v1/auth/me').status_code==401
    assert client.get('/ready').status_code==200

def test_match_4_to_5_company_validates_and_notification(client,register_login,make_admin):
    admin_headers=admin_token(client,make_admin)
    _, company_headers,org_id=company_setup(client,register_login,admin_headers)
    student_id,student_headers=register_login('usuario')
    p=client.put('/api/v1/usuario/perfil',json={'name':'Camila Demo','career':'Ingeniería de Sistemas','semester':6,'age':21,'city':'La Paz'},headers=student_headers)
    assert p.status_code==200,p.text
    cred=client.post('/api/v1/usuario/credenciales',json={'kind':'skill','value':'Python'},headers=student_headers)
    assert cred.status_code==201,cred.text
    opportunity=client.post('/api/v1/empresa/oportunidades',json={'organization_id':org_id,'title':'Pasantía de prueba','category':'pasantia','deadline':future(30),'official_url':'https://example.org/demo','amount_bob':1500},headers=company_headers)
    assert opportunity.status_code==201,opportunity.text
    oppid=opportunity.json()['id']
    for kind,operator,value in [('career','in','Ingeniería de Sistemas|Informática'),('semester','>=','5'),('age','between','18-25'),('skill','has','Python'),('language','B1','Inglés')]:
        r=client.post(f'/api/v1/empresa/oportunidades/{oppid}/requisitos',json={'kind':kind,'operator':operator,'value':value,'mandatory':True},headers=company_headers)
        assert r.status_code==201,r.text
    course=client.post('/api/v1/empresa/cursos',json={'organization_id':org_id,'title':'Curso Ingles B1','end_date':future(14),'cost_bob':0,'credential_kind':'language','credential_value':'Inglés','credential_level':'B1'},headers=company_headers)
    assert course.status_code==201,course.text
    cid=course.json()['id']
    match=client.get('/api/v1/usuario/match',headers=student_headers)
    assert match.status_code==200,match.text
    result=next(x for x in match.json() if x['opportunity_id']==oppid)
    assert result['met']==4 and result['total']==5 and not result['eligible']
    assert result['requirements'][-1]['courses'][0]['id']==cid
    assert client.post(f'/api/v1/empresa/cursos/{cid}/validar',json={'student_user_id':student_id},headers=company_headers).status_code==409
    assert client.post(f'/api/v1/usuario/cursos/{cid}/inscribir',headers=student_headers).status_code==201
    assert client.post(f'/api/v1/empresa/cursos/{cid}/validar',json={'student_user_id':student_id},headers=student_headers).status_code==403
    validation=client.post(f'/api/v1/empresa/cursos/{cid}/validar',json={'student_user_id':student_id},headers=company_headers)
    assert validation.status_code==200,validation.text
    again=client.get('/api/v1/usuario/match',headers=student_headers)
    result=next(x for x in again.json() if x['opportunity_id']==oppid)
    assert result['eligible'] and result['met']==5
    assert len(client.get('/api/v1/notificaciones',headers=student_headers).json())>=1
    assert client.get('/api/v1/empresa/estadisticas',params={'organization_id':org_id},headers=student_headers).status_code==403

def test_finance_isolation_and_school_cannot_access_money(client,register_login):
    _,first=register_login()
    _,second=register_login()
    for h in [first,second]:
        assert client.put('/api/v1/usuario/perfil',json={'name':'Adulto Demo','career':'Derecho','semester':3,'age':21,'city':'Sucre'},headers=h).status_code==200
    row=client.post('/api/v1/usuario/finanzas/movimientos',json={'direction':'income','amount_bob':'420.00','category':'Beca','happened_on':date.today().isoformat()},headers=first)
    assert row.status_code==201,row.text
    eid=row.json()['id']
    assert client.get('/api/v1/usuario/finanzas/movimientos',headers=first).json()[0]['amount_bob']=='420.00'
    assert client.get('/api/v1/usuario/finanzas/movimientos',headers=second).json()==[]
    assert client.delete(f'/api/v1/usuario/finanzas/movimientos/{eid}',headers=second).status_code==404
    assert client.put('/api/v1/usuario/finanzas/presupuestos',json={'category':'Materiales','month':'2026-11','limit_bob':'350'},headers=first).status_code==200
    assert client.post('/api/v1/usuario/finanzas/obligaciones',json={'title':'Pago universidad','amount_bob':'50','due_on':future(4)},headers=first).status_code==201
    summary=client.get('/api/v1/usuario/finanzas/resumen',headers=first)
    assert summary.status_code==200 and summary.json()['balance_bob']=='420.00'
    _, school=register_login()
    assert client.put('/api/v1/usuario/escolar/perfil',json={'full_name':'Colegiada Demo','city':'La Paz','graduation_year':2026,'average_grade':87,'math_grade':85},headers=school).status_code==200
    assert client.get('/api/v1/usuario/finanzas/resumen',headers=school).status_code==403
    assert client.put('/api/v1/usuario/perfil',json={'name':'No permitido','career':'Derecho','semester':1,'age':16,'city':'La Paz'},headers=school).status_code==409

def test_scholarship_only_after_official_rules_approved(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _, company,org=company_setup(client,register_login,admin)
    _,student=register_login()
    assert client.put('/api/v1/usuario/escolar/perfil',json={'full_name':'Colegiado','city':'La Paz','graduation_year':2026,'average_grade':91,'math_grade':92},headers=student).status_code==200
    opp=client.post('/api/v1/empresa/oportunidades',json={'organization_id':org,'title':'Beca de ejemplo no real','category':'beca','deadline':future(30),'official_url':'https://example.org','amount_bob':0},headers=company)
    assert opp.status_code==201,opp.text
    oid=opp.json()['id']
    assert client.get(f'/api/v1/usuario/becas/{oid}/simular',headers=student).json()['discount_percent'] is None
    band=client.put(f'/api/v1/empresa/becas/{oid}/bandas',headers=company,json={'percent_discount':75,'min_average':'90','min_math':'90','official_published':True,'official_url':'https://example.org/reglamento'})
    assert band.status_code==200,band.text
    assert client.get(f'/api/v1/usuario/becas/{oid}/simular',headers=student).json()['status']=='sin_estimacion'
    assert client.patch(f'/api/v1/admin/becas/bandas/{band.json()["id"]}/revisar',json={'approved':True},headers=company).status_code==403
    assert client.patch(f'/api/v1/admin/becas/bandas/{band.json()["id"]}/revisar',json={'approved':True},headers=admin).status_code==200
    after=client.get(f'/api/v1/usuario/becas/{oid}/simular',headers=student)
    assert after.json()['discount_percent']==75
    assert 'No garantiza' in after.json()['message']

def test_community_events_and_admin_stats(client,register_login,make_admin):
    admin=admin_token(client,make_admin)
    _,company,org=company_setup(client,register_login,admin)
    id1,student=register_login()
    post=client.post('/api/v1/comunidad/publicaciones',json={'title':'Curso para estudiantes','body':'Hola, este es un contenido de prueba.'},headers=student)
    assert post.status_code==201,post.text
    pid=post.json()['id']
    assert client.get('/api/v1/comunidad/publicaciones').status_code==200
    comment=client.post(f'/api/v1/comunidad/publicaciones/{pid}/comentarios',json={'body':'Me interesa'},headers=company)
    assert comment.status_code==201,comment.text
    assert client.delete(f'/api/v1/comunidad/publicaciones/{pid}',headers=company).status_code==403
    event=client.post('/api/v1/empresa/eventos',json={'organization_id':org,'title':'Feria Universitaria','description':'Presentaciones y orientación','starts_at':(datetime.now(timezone.utc)+timedelta(days=5)).isoformat(),'public_url':'https://example.org'},headers=company)
    assert event.status_code==201,event.text
    assert client.get('/api/v1/eventos').status_code==200
    assert client.get('/api/v1/admin/resumen',headers=admin).json()['users']>=3
    assert client.delete(f'/api/v1/comunidad/publicaciones/{pid}',headers=admin).status_code==200
