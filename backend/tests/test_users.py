def test_three_role_displays_are_separate(client,register_login,make_admin):
    _,user=register_login()
    _,company=register_login('empresa')
    email,pwd=make_admin()
    result=client.post('/api/v1/auth/login',json={'email':email,'password':pwd})
    admin={'Authorization':'Bearer '+result.json()['access_token']}
    assert client.get('/api/v1/usuario/dashboard',headers=user).status_code==200
    assert client.get('/api/v1/empresa/dashboard',headers=company).status_code==200
    assert client.get('/api/v1/admin/dashboard',headers=admin).status_code==200
    assert client.get('/api/v1/empresa/dashboard',headers=user).status_code==403
