from datetime import date, timedelta

def test_company_course_requires_verified_organization(client,register_login):
    _,company=register_login('empresa')
    org=client.post('/api/v1/empresa/organizaciones',headers=company,json={'name':'Institucion de ejemplo'})
    assert org.status_code==201
    course={'organization_id':org.json()['id'],'title':'Curso de ejemplo','end_date':(date.today()+timedelta(days=15)).isoformat(),
            'cost_bob':0,'credential_kind':'language','credential_value':'Inglés','credential_level':'B1'}
    assert client.post('/api/v1/empresa/cursos',headers=company,json=course).status_code==403
