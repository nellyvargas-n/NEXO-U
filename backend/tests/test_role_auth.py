import os
os.environ.setdefault('DATABASE_URL','sqlite:///./test_role_auth.sqlite3')
os.environ.setdefault('JWT_SECRET','test-secret-abcdefghijklmnopqrstuvwxyz-1234567890')
from fastapi.testclient import TestClient
from app.main import app

def test_role_auth():
    with TestClient(app) as c:
        email='newstudent-test@example.com'
        r=c.post('/api/v1/auth/register',json={'email':email,'password':'securepassword123','role':'usuario'})
        assert r.status_code in (201,409)
        assert c.post('/api/v1/auth/register',json={'email':'bad@example.com','password':'securepassword123','role':'admin'}).status_code==422
        token=c.post('/api/v1/auth/login',json={'email':email,'password':'securepassword123'}).json()['access_token']
        h={'Authorization':'Bearer '+token}
        assert c.get('/api/v1/usuario/panel',headers=h).status_code==200
        assert c.get('/api/v1/admin/usuarios',headers=h).status_code==403
        assert c.get('/api/v1/auth/me').status_code==401
