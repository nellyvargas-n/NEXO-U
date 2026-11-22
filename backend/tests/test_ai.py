def test_educational_assistant_never_decides_scholarship(client,register_login):
    _,user=register_login()
    r=client.get('/api/v1/asistente/estado')
    assert r.status_code==200 and r.json()['generative_ai_used'] is False
    r=client.post('/api/v1/usuario/asistente/preguntar',headers=user,json={'question':'¿Qué es una beca?'})
    assert r.status_code==200
