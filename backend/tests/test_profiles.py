def test_student_can_create_university_profile(client,register_login):
    _,token=register_login()
    data={'name':'Estudiante de prueba','career':'Sistemas','semester':5,'age':19,'city':'La Paz'}
    assert client.put('/api/v1/usuario/perfil',headers=token,json=data).status_code==200
    r=client.get('/api/v1/usuario/perfil',headers=token)
    assert r.status_code==200 and r.json()['career']=='Sistemas'
    assert client.get('/api/v1/usuario/perfil').status_code==401
