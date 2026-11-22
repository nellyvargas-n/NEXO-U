def test_community_posts_have_owner_permissions(client,register_login):
    _,user=register_login()
    _,other=register_login()
    r=client.post('/api/v1/comunidad/publicaciones',headers=user,json={'title':'Comunidad de prueba','body':'Mensaje para compañeros'})
    assert r.status_code==201
    assert client.delete(f"/api/v1/comunidad/publicaciones/{r.json()['id']}",headers=other).status_code==403
    assert client.delete(f"/api/v1/comunidad/publicaciones/{r.json()['id']}",headers=user).status_code==200
