# Migraciones versionadas de NEXO U

Se incluyen **dos revisiones**: `20261122_01` (línea base del esquema v1.2 **ya existente**, no crea ni borra tablas) y `20261122_02` (agrega `auth_attempts` y `password_reset_tokens`).

## Neon existente (v1.2)

Nunca ejecutes ambos métodos de instalación de v1.4 a la vez. Antes de cambiar `production`, crea una rama de prueba y verifica una copia de seguridad.

**Método sencillo con SQL Editor (recomendado para hackathon):** ejecuta únicamente `sql/07_seguridad_v14.sql` en `prueba-v12`, y después `sql/08_comprobar_v14.sql` para lectura. No vuelvas a ejecutar `NEON_CONSOLE_TODO.sql` ni `05_integracion_escolar_neon.sql` sobre una base ya actualizada. Si luego quieres registrar Alembic, ejecuta `alembic stamp 20261122_02` (marca la revisión como aplicada, sin DDL).

**Método Alembic (alternativo):** configura `DATABASE_URL_UNPOOLED` con la URL de conexión **directa** de ESA rama de Neon (no `-pooler`) y `DATABASE_URL` con la URL de app. En `backend/` ejecuta:

```powershell
python -m alembic stamp 20261122_01
python -m alembic upgrade head
```

No ejecutes `stamp head` **antes** de la migración: eso haría parecer que los cambios existen aunque no se hayan aplicado. No ejecutes `upgrade head` tras aplicar ya el SQL de `07`, salvo que hayas registrado la versión con `stamp 20261122_02`.

El método Alembic requiere que la conexión se encuentre habilitada y que se hayan configurado variables reales **solo** en `.env`, fuera de Git. Nunca se hacen estas operaciones en pruebas locales automatizadas.
