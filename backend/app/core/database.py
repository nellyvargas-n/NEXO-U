"""Neon PostgreSQL (psycopg 3) o SQLite solo para pruebas."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

class Base(DeclarativeBase):
    pass

url=settings.database_url
if url.startswith('postgres://'):
    url='postgresql+psycopg://'+url[len('postgres://'):]
elif url.startswith('postgresql://'):
    url='postgresql+psycopg://'+url[len('postgresql://'):]
connect_args={'check_same_thread':False} if url.startswith('sqlite') else {}
options={'pool_pre_ping':True,'pool_recycle':300} if not url.startswith('sqlite') else {}
if not url.startswith('sqlite'):
    options.update(pool_size=3,max_overflow=2,pool_timeout=15)
engine=create_engine(url,connect_args=connect_args,**options)
SessionLocal=sessionmaker(bind=engine,autoflush=False,expire_on_commit=False)

def get_db():
    with SessionLocal() as session:
        yield session
