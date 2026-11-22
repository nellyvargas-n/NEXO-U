# Migraciones versionadas de NEXO U

Alembic conserva el esquema v1.2 existente como revisión de línea base y aplica los cambios posteriores hasta `20261122_08`. La revisión `_07` carga de manera idempotente el catálogo público y `_08` garantiza los programas oficiales de becas escolares; `_06` agrega las tablas de contenido y pagos de cursos.

## Aplicación automática

- **Docker:** al iniciar el contenedor, el `CMD` de `Dockerfile` ejecuta `python -m alembic upgrade head` antes de arrancar FastAPI. Si una migración falla, el backend no se anuncia como listo.
- **Vercel (proyecto con raíz `backend/`):** `vercel.json` instala las dependencias y ejecuta la misma actualización durante el build. Configura `DATABASE_URL` y, para Neon, preferiblemente `DATABASE_URL_UNPOOLED` en las variables del entorno Preview/Production del proyecto backend. Un cambio de variables requiere un despliegue nuevo.

## Base Neon preexistente

Antes de conectar una base ya creada, confirma que corresponde a la rama de pruebas y conserva un respaldo. Si la base se creó con los scripts SQL antiguos, no ejecutes los scripts otra vez: registra la línea base que corresponda y aplica solo las revisiones posteriores que falten. Nunca ejecutes SQL y Alembic para la misma revisión.

Para una Neon que ya tiene el esquema v1.2 y se prepara por primera vez para Alembic:

```bash
python -m alembic stamp 20261122_01
python -m alembic upgrade head
```

`stamp` solo registra una versión; no crea tablas. No uses `stamp head` para ocultar una migración pendiente. Comprueba el estado con `python -m alembic current`.
