# Alembic para NEXO U

Esta carpeta ya tiene configuración funcional y un *baseline* v1.2.
**Importante**: esta revisión es un marcador **sin ALTER ni CREATE**.
No crea la base en una instancia vacía: para eso están los SQL de `backend/sql/`.

Para una base que YA está en v1.2 (el endpoint `/ready` responde `ready`):

1. Crea una rama de prueba en Neon y conserva una copia de respaldo.
2. Usa el `.env` local con la `DATABASE_URL` de ESA rama, nunca una clave real en Git.
3. Ejecuta `alembic stamp head` para registrar el baseline **sin modificar las tablas**.
4. A partir de ahí usa revisiones nuevas y revisadas de Alembic para cambios posteriores.

`alembic upgrade head` sobre una base vacía **no instala NEXO U**.
Nunca lances `--autogenerate` contra una rama de producción sin revisar el SQL generado.
