from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
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

app=FastAPI(title="NEXO U | API Neon | 3 roles",version="1.0.0",lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=[x.strip() for x in settings.cors_origins.split(",")],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(router)

@app.get("/health")
def health():return {"status":"ok"}


@app.get("/ready")
def ready():
    try:
        with engine.connect() as conn:
            conn.execute(sql_text("SELECT 1"))
            if engine.dialect.name=='postgresql':
                tables=conn.execute(sql_text("SELECT to_regclass('public.app_users'), to_regclass('public.opportunities'), to_regclass('public.finance_entries')")).first()
                if tables is None or any(value is None for value in tables):
                    raise RuntimeError('Faltan tablas de Neon')
            elif not all(inspect(engine).has_table(t) for t in ('app_users','opportunities','finance_entries')):
                raise RuntimeError('Faltan tablas de base de datos')
        return {"status":"ready","database":"connected","schema":"ready"}
    except Exception:
        raise HTTPException(503,detail="No se pudo conectar a PostgreSQL. Revisa DATABASE_URL y Neon Console.")

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def home():
    return """<!doctype html><html lang=es><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>NEXO U · API</title><style>body{background:#0b1327;color:#e6efff;font-family:system-ui;padding:28px;line-height:1.7;max-width:760px;margin:auto}a{color:#89ccff}.pill{border:1px solid #397fbd;border-radius:12px;padding:20px;background:#182640}code{color:#adffa5}</style></head><body><h1>NEXO U · Backend</h1><p>API FastAPI para estudiantes, empresas y administradores. No requiere frontend para probarla.</p><div class=pill><p>Servidor <code>en línea</code></p><p><a href=/docs>Swagger /docs</a> · <a href=/health>Estado /health</a> · <a href=/ready>Conexión Neon /ready</a></p><p>Para usar las rutas privadas, inicia sesión en <code>/api/v1/auth/login</code> y autoriza el token Bearer en Swagger.</p></div></body></html>"""
