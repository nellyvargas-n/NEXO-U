from datetime import date, timedelta

def test_public_catalog_rejects_unverified_company(client,register_login):
    _,company=register_login('empresa')
    org=client.post('/api/v1/empresa/organizaciones',headers=company,json={'name':'Institucion no verificada'})
    data={'organization_id':org.json()['id'],'title':'Pasantía de muestra','category':'pasantia',
          'deadline':(date.today()+timedelta(days=20)).isoformat(), 'official_url':'https://example.org/demo','amount_bob':100}
    assert client.post('/api/v1/empresa/oportunidades',headers=company,json=data).status_code==403
    assert client.get('/api/v1/oportunidades/publicas').status_code==200
