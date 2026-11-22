"""Regresiones de orientación, seguridad y compatibilidad React de v1.3."""
from pathlib import Path
from types import SimpleNamespace
from decimal import Decimal

import pytest
from pydantic import ValidationError
from app.ai.safety import redact_sensitive, clean_question
from app.ai.chat_assistant import answer_question
from app.ai.gemini_client import GeminiClient, AIUnavailable
from app.ai.course_recommender import courses_for_missing_requirements
from app.ai.matching_assistant import summarize_matches
from app.ai.profile_assistant import profile_next_steps
from app.services.budget_service import available_budget
from app.services.report_service import privacy_safe_count
from app.services.transaction_service import balance_bob
from app.schemas.auth import RegistrationRequest
from app.schemas.matching import MatchingOpportunity
from app.schemas.course import CourseRead


def test_public_config_has_no_password_or_git_conflict():
    path = Path(__file__).parents[1] / '.env.example'
    text = path.read_text()
    assert '<<<<<<<' not in text and '=======' not in text and '>>>>>>>' not in text
    assert 'npg_' not in text
    assert 'JWT_SECRET=REEMPLAZA' in text
    assert not (path.parent / '.env').exists()


def test_assistant_status_and_access_control(client, register_login):
    r=client.get('/api/v1/asistente/estado')
    assert r.status_code == 200 and r.json()['generative_ai_used'] is False
    assert client.post('/api/v1/usuario/asistente/preguntar', json={'question':'¿Becas disponibles?'}).status_code == 401
    _, headers = register_login('usuario')
    reply=client.post('/api/v1/usuario/asistente/preguntar', headers=headers, json={'question':'¿Qué es B1?'} )
    assert reply.status_code == 200 and 'B1' in reply.json()['answer']
    assert reply.json()['generative_ai_used'] is False
    assert client.get('/api/v1/usuario/rutas', headers=headers).status_code == 404
    profile = {'name':'Luz de prueba', 'career':'Sistemas', 'semester':5, 'age':19, 'city':'La Paz'}
    assert client.put('/api/v1/usuario/perfil', headers=headers, json=profile).status_code == 200
    paths = client.get('/api/v1/usuario/rutas', headers=headers)
    assert paths.status_code == 200 and isinstance(paths.json(), list)
    summary = client.get('/api/v1/usuario/match/resumen', headers=headers)
    assert summary.status_code == 200 and 'eligible' in summary.json()
    _, company = register_login('empresa')
    assert client.get('/api/v1/usuario/rutas', headers=company).status_code == 403


def test_match_recommendations_keep_operator_level_and_sponsorship_out():
    matches=[{'opportunity_id':3,'title':'Pasantía (ficticia)','deadline':'2027-01-12',
             'met':4,'total':5,'is_demo':True,'eligible':False,
             'requirements':[{'kind':'language','operator':'B1','required':'Inglés',
             'required_level':'B1','status':'falta','courses':[
                 {'id':4,'title':'Inglés B1','ends_on':'2027-01-05','cost_bob':0,'credential_level':'B1'}]}]}]
    routes = courses_for_missing_requirements(matches)
    assert len(routes) == 1
    assert routes[0]['operator'] == routes[0]['required_level'] == 'B1'
    assert routes[0]['is_demo'] is True
    assert summarize_matches(matches)['eligible'] == 0


def test_no_external_ai_without_key_and_privacy_guards():
    with pytest.raises(AIUnavailable):
        GeminiClient(key='').explain_public_text('Convocatoria pública')
    secret = 'postgresql://user:myPassword@private.example.com/neondb'
    assert 'myPassword' not in redact_sensitive(secret)
    assert 'abc123' not in redact_sensitive('Bearer abc123')
    assert '[correo_oculto]' in clean_question('Escribí a nombre@example.org')
    assert answer_question('¿Cómo saber si me dan una beca?')['generative_ai_used'] is False
    with pytest.raises(ValueError):
        clean_question('x'*400)


def test_math_and_small_counts_are_private():
    rows=[SimpleNamespace(direction='income', amount_bob='500.20'),
          SimpleNamespace(direction='expense', amount_bob='125.15')]
    assert balance_bob(rows) == Decimal('375.05')
    assert available_budget(Decimal('100'),Decimal('25.50')) == Decimal('74.50')
    assert privacy_safe_count(4) is None and privacy_safe_count(5) == 5


def test_contracts_validate_inputs_and_versions(client):
    with pytest.raises(ValidationError):
        RegistrationRequest(email='not_an_email', password='short', role='admin')
    course=CourseRead(id=1,title='Test',end_date='2027-01-01',cost_bob=0,
                      credential_kind='language',credential_value='Inglés',
                      credential_level='B1',organization='Escuela')
    assert course.credential_level == 'B1'
    assert client.get('/api/v1/meta').json()['api_version'] == '1.3.0'
    routes=client.get('/openapi.json').json()['paths']
    for path in ['/api/v1/usuario/rutas','/api/v1/asistente/estado','/api/v1/usuario/match',
                 '/api/v1/empresa/cursos/{course_id}/inscripciones']:
        assert path in routes


def test_react_routes_include_real_english_b1_and_clear_after_validation(client, register_login, make_admin):
    """Prueba API real: 4/5 -> ruta de B1 -> validación del emisor -> sin faltantes."""
    from tests.test_flow_completo import admin_token, company_setup, future
    admin = admin_token(client, make_admin)
    _, company, org_id = company_setup(client, register_login, admin)
    user_id, student = register_login('usuario')
    r = client.put('/api/v1/usuario/perfil', headers=student, json={
        'name': 'Alumno ejemplo', 'career': 'Sistemas', 'semester': 6, 'age': 21, 'city': 'La Paz'})
    assert r.status_code == 200
    assert client.post('/api/v1/usuario/credenciales', headers=student, json={
        'kind':'skill','value':'Python'}).status_code == 201
    result = client.post('/api/v1/empresa/oportunidades', headers=company, json={
        'organization_id':org_id, 'title':'Pasantía privada de prueba',
        'category':'pasantia', 'deadline':future(30), 'official_url':'https://example.org/prueba',
        'amount_bob':0})
    assert result.status_code == 201
    opportunity_id = result.json()['id']
    for kind, operator, value in [('career','in','Sistemas'),('semester','>=','5'),('age','between','18-25'),
                                  ('skill','has','Python'),('language','B1','Inglés')]:
        check = client.post(f'/api/v1/empresa/oportunidades/{opportunity_id}/requisitos',
                            headers=company, json={'kind':kind,'operator':operator,'value':value, 'mandatory':True})
        assert check.status_code == 201
    course = client.post('/api/v1/empresa/cursos', headers=company, json={
        'organization_id':org_id, 'title':'Inglés B1 de prueba', 'end_date':future(14),
        'cost_bob':0, 'credential_kind':'language', 'credential_value':'Inglés', 'credential_level':'B1'})
    assert course.status_code == 201
    course_id = course.json()['id']
    routes = client.get('/api/v1/usuario/rutas', headers=student)
    assert routes.status_code == 200
    matches = [x for x in routes.json() if x['opportunity_id'] == opportunity_id]
    assert matches and any(m['course_id'] == course_id for m in matches)
    assert all(m['operator'] == 'B1' and m['required_level'] == 'B1' for m in matches)
    assert client.post(f'/api/v1/usuario/cursos/{course_id}/inscribir', headers=student).status_code == 201
    assert client.post(f'/api/v1/empresa/cursos/{course_id}/validar', headers=company,
                       json={'student_user_id':user_id}).status_code == 200
    after = client.get('/api/v1/usuario/rutas', headers=student)
    assert after.status_code == 200
    assert not [x for x in after.json() if x['opportunity_id'] == opportunity_id]
    summary = client.get('/api/v1/usuario/match/resumen', headers=student)
    assert summary.status_code == 200 and summary.json()['eligible'] >= 1
