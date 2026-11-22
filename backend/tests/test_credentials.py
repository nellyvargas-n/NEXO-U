def test_credentials_are_private(client,register_login):
    _,alice=register_login()
    _,bob=register_login()
    profile={'name':'Alumno de prueba','career':'Sistemas','semester':6,'age':20,'city':'La Paz'}
    assert client.put('/api/v1/usuario/perfil',headers=alice,json=profile).status_code==200
    assert client.put('/api/v1/usuario/perfil',headers=bob,json=profile).status_code==200
    r=client.post('/api/v1/usuario/credenciales',headers=alice,json={'kind':'skill','value':'Python'})
    assert r.status_code==201
    assert len(client.get('/api/v1/usuario/credenciales',headers=bob).json())==0
    assert client.delete('/api/v1/usuario/credenciales/'+str(r.json()['id']),headers=bob).status_code==404
