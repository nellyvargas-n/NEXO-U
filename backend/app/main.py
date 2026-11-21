from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base,engine,SessionLocal
from app.models import entities  # noqa: F401 — registra modelos
from app.core.seed import seed
from app.api.v1.router import router

@asynccontextmanager
async def lifespan(app:FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db: seed(db)
    yield

app=FastAPI(title="NEXO U MVP",version="0.1.0",lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=[x.strip() for x in settings.cors_origins.split(",")],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(router)

@app.get("/health")
def health():return {"status":"ok"}


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def home():
    return """<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NEXO U · Backend</title><style>body{font-family:system-ui,-apple-system,sans-serif;background:#0b1220;color:#e9eef9;margin:0;padding:28px}main{max-width:850px;margin:auto}h1{font-size:2.4rem;margin-bottom:0}p{color:#bac8df}a{color:#9fc5ff}button{border:0;border-radius:10px;background:#5b85ee;color:white;padding:12px 18px;cursor:pointer;font-weight:600}.card{background:#172238;border:1px solid #33435e;border-radius:16px;padding:22px;margin:18px 0}.status{color:#70e3aa}pre{background:#0c1527;padding:18px;overflow:auto;border-radius:10px;white-space:pre-wrap;overflow-wrap:anywhere}small{color:#a6b5ce}</style></head><body><main><h1>NEXO U · Backend</h1><p class="status">● API FastAPI en funcionamiento</p><p>Panel técnico de prueba (no es el frontend React). Datos ficticios.</p><div class="card"><h2>Prueba de elegibilidad</h2><p>Camila debe pasar de 4/5 a 5/5 al validar su curso de Inglés B1.</p><button onclick="loadMatch()">Consultar matching</button> <a href="/docs">Abrir Swagger /docs</a><pre id="result">Pulsa «Consultar matching» para ver el resultado.</pre></div><div class="card"><h2>Rutas disponibles</h2><p><a href="/health">/health</a> · <a href="/api/v1/profiles/me">/api/v1/profiles/me</a> · <a href="/api/v1/opportunities">/api/v1/opportunities</a> · <a href="/api/v1/courses">/api/v1/courses</a> · <a href="/api/v1/match">/api/v1/match</a> · <a href="/api/v1/finance/reach">/api/v1/finance/reach</a></p><small>La validación del curso se prueba en Swagger con la cabecera x-emitter-key; no expongas claves de producción.</small></div></main><script>async function loadMatch(){let out=document.getElementById('result');out.textContent='Consultando...';try{let r=await fetch('/api/v1/match');let j=await r.json();out.textContent=JSON.stringify(j,null,2)}catch(e){out.textContent='Error: '+e.message}}loadMatch();</script></body></html>"""
