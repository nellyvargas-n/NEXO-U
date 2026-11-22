"""Punto de partida documentado para esquemas Neon ya actualizados a v1.2.

NO CREA tablas en una base vacía. Primero usa NEON_CONSOLE_TODO.sql y
05_integracion_escolar_neon.sql en una rama de prueba. Comprueba /ready,
luego `alembic stamp head` para registrar esta línea base sin ejecutar cambios.
"""
revision = '20261122_01'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    pass  # Migración de referencia: esquema v1.2 ya existente

def downgrade():
    pass  # Nunca se borra una base existente como rollback de una línea base
