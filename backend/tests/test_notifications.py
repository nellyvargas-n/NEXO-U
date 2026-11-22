def test_notifications_require_login(client,register_login):
    _,user=register_login()
    assert client.get('/api/v1/notificaciones').status_code==401
    assert client.get('/api/v1/notificaciones',headers=user).status_code==200
