def test_validation_requires_company_token(client,register_login):
    _,user=register_login()
    assert client.post('/api/v1/empresa/cursos/1/validar',headers=user,json={'student_user_id':1}).status_code==403
