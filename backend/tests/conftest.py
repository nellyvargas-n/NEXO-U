"""Tests aislados: solo SQLite temporal; NUNCA conecta a tu proyecto de Neon."""
import os, atexit, shutil, tempfile
from pathlib import Path
import pytest

_testdir=Path(tempfile.mkdtemp(prefix='nexou_backend_tests_'))
atexit.register(lambda: shutil.rmtree(_testdir,ignore_errors=True))
os.environ['DATABASE_URL']='sqlite:///'+str(_testdir/'test.db')
os.environ['DEMO_MODE']='false'
os.environ['JWT_SECRET']='test_secret_only_for_pytest_abcdefghijklmnopqrstuvwxyz_0123456789'

from app.core.database import Base, engine, SessionLocal
from app.models import entities,access,extended,auth_security
from fastapi.testclient import TestClient
from app.main import app

Base.metadata.create_all(bind=engine)

@pytest.fixture
def client():
    with TestClient(app) as c: yield c

@pytest.fixture
def make_admin():
    from app.models.access import AppUser
    from app.core.auth_jwt import hash_password
    from uuid import uuid4
    def create():
        email=f'admin-{uuid4().hex[:9]}@example.com'
        password='SuperSafePassword123!'
        with SessionLocal() as db:
            db.add(AppUser(email=email,password_hash=hash_password(password),role='admin',active=True))
            db.commit()
        return email,password
    return create

@pytest.fixture
def register_login(client):
    from uuid import uuid4
    def run(role='usuario'):
        email=f'{role}-{uuid4().hex[:12]}@example.com'
        password='SuperSafePassword123!'
        resp=client.post('/api/v1/auth/register',json={'email':email,'password':password,'role':role})
        assert resp.status_code==201,resp.text
        token=client.post('/api/v1/auth/login',json={'email':email,'password':password})
        assert token.status_code==200,token.text
        return resp.json()['id'],{'Authorization':'Bearer '+token.json()['access_token']}
    return run
