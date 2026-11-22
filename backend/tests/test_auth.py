"""Autenticación y recuperación de contraseña con SMTP simulado."""
from app.core.config import settings
from app.core import auth_safety


def test_password_reset_rejects_without_mail_service(client,register_login,monkeypatch):
    _,_ = register_login()
    monkeypatch.setattr(settings,'smtp_host','')
    r=client.post('/api/v1/auth/recuperar-clave/solicitar',json={'email':'unknown@example.com'})
    assert r.status_code==503


def test_password_reset_flow_revokes_prior_token(client,monkeypatch):
    import uuid
    email=f'reset-{uuid.uuid4().hex[:10]}@example.com'
    password='SomeSecurePass123!'
    assert client.post('/api/v1/auth/register',json={'email':email,'password':password,'role':'usuario'}).status_code==201
    old=client.post('/api/v1/auth/login',json={'email':email,'password':password}).json()['access_token']
    sent=[]
    monkeypatch.setattr(settings,'smtp_host','smtp.example.test')
    monkeypatch.setattr(settings,'smtp_from','support@example.test')
    monkeypatch.setattr(auth_safety,'send_password_reset',lambda to,token: sent.append((to,token)))
    r=client.post('/api/v1/auth/recuperar-clave/solicitar',json={'email':email})
    assert r.status_code==202 and len(sent)==1 and sent[0][0]==email
    response=client.post('/api/v1/auth/recuperar-clave/confirmar',json={'token':sent[0][1],'new_password':'AnotherSecurePass456!'})
    assert response.status_code==200
    assert client.post('/api/v1/auth/recuperar-clave/confirmar',json={'token':sent[0][1],'new_password':'AnotherSecurePass789!'}).status_code==400
    assert client.get('/api/v1/auth/me',headers={'Authorization':'Bearer '+old}).status_code==401
    assert client.post('/api/v1/auth/login',json={'email':email,'password':password}).status_code==401
    assert client.post('/api/v1/auth/login',json={'email':email,'password':'AnotherSecurePass456!'}).status_code==200


def test_login_throttles_repeated_wrong_password(client):
    import uuid
    email=f'wrong-{uuid.uuid4().hex[:12]}@example.com'
    for i in range(5):
        assert client.post('/api/v1/auth/login',json={'email':email,'password':'wrong'}).status_code==401
    assert client.post('/api/v1/auth/login',json={'email':email,'password':'wrong'}).status_code==429
