def test_admin_route_requires_admin(client,register_login):
    _,student=register_login()
    _,org=register_login('empresa')
    assert client.get('/api/v1/admin/dashboard').status_code==401
    assert client.get('/api/v1/admin/usuarios',headers=student).status_code==403
    assert client.get('/api/v1/admin/usuarios',headers=org).status_code==403
