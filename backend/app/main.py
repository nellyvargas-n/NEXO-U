from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base,engine,SessionLocal
from app.models import access  # noqa: F401
from app.models import entities  # noqa: F401 — registra modelos
from app.models import extended  # noqa: F401 — módulos ampliados
from app.core.seed import seed
from app.api.v1.router import router
from sqlalchemy import text as sql_text, inspect

@asynccontextmanager
async def lifespan(app:FastAPI):
    if settings.demo_mode:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db: seed(db)
    yield

app=FastAPI(title="NEXO U | API Neon | 3 roles",version="1.2.0",lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=[x.strip() for x in settings.cors_origins.split(",")],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(router)

@app.get("/health")
def health():return {"status":"ok","service":"NEXO-U","version":"1.2.0"}


@app.get("/ready")
def ready():
    if len(settings.jwt_secret) < 32 or settings.jwt_secret.startswith(('REEMPLAZA','CAMBIA','GENERAR')):
        raise HTTPException(503, detail="JWT_SECRET inválido: genera una clave aleatoria de al menos 32 caracteres")
    try:
        with engine.connect() as conn:
            conn.execute(sql_text("SELECT 1"))
            inspector = inspect(engine)
            required = {
                'app_users': {'id', 'role'},
                'opportunities': {'id', 'is_demo'},
                'credentials': {'id', 'student_user_id'},
                'enrollments': {'id', 'student_user_id'},
                'finance_entries': {'id', 'user_id'},
            }
            missing = []
            for table_name, fields in required.items():
                if not inspector.has_table(table_name):
                    missing.append(table_name)
                else:
                    existing = {column['name'] for column in inspector.get_columns(table_name)}
                    missing.extend(f'{table_name}.{field}' for field in (fields - existing))
            if missing:
                raise HTTPException(503, detail="Esquema v1.2 incompleto. Ejecuta sql/05_integracion_escolar_neon.sql en una rama de Neon antes de usar la API. Faltantes: " + ', '.join(missing))
        return {"status":"ready","database":"connected","schema":"v1.2"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, detail="No se pudo consultar la base de datos. Revisa DATABASE_URL, SSL y disponibilidad de Neon.")

@app.get("/README.md",response_class=PlainTextResponse,include_in_schema=False)
@app.get("/readme",response_class=PlainTextResponse,include_in_schema=False)
def readme():
    return "NEXO U Backend v1.2\n\nDocumentación: /docs\nSalud: /health\nNeon: /ready\nAPI: /api/v1/meta\nInstrucciones completas en backend/README.md dentro del ZIP.\n"

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def home():
    return """<!doctype html><html lang=es><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>NEXO U · API</title><style>body{background:#0b1327;color:#e6efff;font-family:system-ui;padding:28px;line-height:1.7;max-width:760px;margin:auto}a{color:#89ccff}.pill{border:1px solid #397fbd;border-radius:12px;padding:20px;background:#182640}code{color:#adffa5}</style></head><body><h1>NEXO U · Backend</h1><p>API FastAPI para estudiantes, empresas y administradores. No requiere frontend para probarla.</p><div class=pill><p>Servidor <code>en línea</code></p><p><a href=/docs>Swagger /docs</a> · <a href=/health>Estado /health</a> · <a href=/ready>Conexión Neon /ready</a> · <a href=/README.md>README</a></p><p>Para usar las rutas privadas, inicia sesión en <code>/api/v1/auth/login</code> y autoriza el token Bearer en Swagger.</p></div></body></html>"""
