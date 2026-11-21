from contextlib import asynccontextmanager
from fastapi import FastAPI
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
