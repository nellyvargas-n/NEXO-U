"""Alembic para migraciones posteriores a la base ya aplicada en Neon.

La revisión inicial es un marcador no destructivo. Para una Neon EXISTENTE que
ya pasó /ready, marca la versión con `alembic stamp head` si corresponde.
"""
from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool
from app.core.config import settings
from app.core.database import Base
from app.models import entities, access, extended  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
if not settings.database_url:
    raise RuntimeError('Configura DATABASE_URL antes de ejecutar Alembic')
url = settings.database_url
if url.startswith('postgres://'):
    url = 'postgresql+psycopg://' + url[len('postgres://'):]
elif url.startswith('postgresql://'):
    url = 'postgresql+psycopg://' + url[len('postgresql://'):]
config.set_main_option('sqlalchemy.url', url.replace('%', '%%'))
target_metadata = Base.metadata


def run_migrations_offline():
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True,
                      dialect_opts={'paramstyle': 'named'}, compare_type=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}),
                                     prefix='sqlalchemy.', poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
