# Backend NEXO U — MVP funcional

## Ejecutar (Python 3.11+)

```bash
cd backend
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env  # En Windows: copy .env.example .env
uvicorn app.main:app --reload
```

Abre http://localhost:8000/docs. En el primer inicio se crea una base SQLite con **datos ilustrativos**: Camila, una pasantía ficticia y un curso de Inglés B1 ficticio. Sustituye las oportunidades por convocatorias reales verificadas antes de la presentación. No hay integración bancaria ni pagos reales.

## Flujo de demostración

1. `GET /api/v1/profiles/me` → Camila.
2. `GET /api/v1/match` → 4/5; falta Inglés B1; curso recomendado.
3. `POST /api/v1/courses/1/complete` con header `X-Emitter-Key: change-me-for-local-demo` y JSON `{"student_id":1}` → credencial verificada.
4. `GET /api/v1/match` → 5/5.
5. `GET /api/v1/finance/reach` → simulación de alcance.
6. `POST /api/v1/demo/reset` → reinicia datos de demo (solo habilitado en entorno demo).

## Seguridad y límites

Esta versión es **solo para demo local**: utiliza un estudiante fijo, no tiene login real ni RLS. No desplegar con datos personales ni financieros reales. El header de emisor es un secreto compartido **solo de demostración**, no un sistema de identidad robusto. Para producción: autenticación, autorización por organización, PostgreSQL/Supabase y políticas RLS, migraciones, auditoría y protección contra abuso. Nunca subir `.env` al repositorio.

## Pruebas

```bash
pytest -q
```

## Endpoints

- `GET /health`
- `GET /api/v1/profiles/me`
- `GET /api/v1/credentials`
- `GET /api/v1/opportunities`
- `GET /api/v1/match`
- `GET /api/v1/courses`
- `POST /api/v1/courses/{id}/complete`
- `GET /api/v1/finance/reach`
- `POST /api/v1/demo/reset`

Las rutas tienen prefijo `/api/v1`. El matching usa reglas deterministas, sin IA.
