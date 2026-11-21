def test_roles_endpoint_basics(client,register_login):
    _,user=register_login('usuario')
    _,company=register_login('empresa')
    assert client.get('/api/v1/usuario/panel',headers=user).status_code==200
    assert client.get('/api/v1/admin/usuarios',headers=user).status_code==403
    assert client.get('/api/v1/empresa/organizaciones',headers=company).status_code==200
