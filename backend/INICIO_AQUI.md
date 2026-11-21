# NEXO U — instalación segura en Neon Console

## IMPORTANTE: cambia primero la contraseña de Neon
La cadena de conexión anterior se compartió en el chat. En Neon Console restablece la contraseña del rol `neondb_owner`, genera una nueva URL y **no la compartas**. Este ZIP no contiene contraseñas reales.

## No borres la base existente
**No ejecutes el SQL sobre la base de producción sin respaldo.** `CREATE TABLE IF NOT EXISTS` no adapta automáticamente tablas existentes con otro esquema. El SQL puede alterar políticas y generar incompatibilidades. La forma más segura es crear una **rama (branch) de prueba** en Neon, ejecutar allí `backend/sql/NEON_CONSOLE_TODO.sql` y probar la API antes de aplicar cambios a la rama principal.

## Configuración
1. En `backend`, copia `.env.example` a `.env`.
2. Sustituye `DATABASE_URL` por tu URL **nueva**, usando `postgresql+psycopg://` como prefijo y conservando los parámetros SSL.
3. Genera `JWT_SECRET` con `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
4. Ejecuta el SQL en el SQL Editor de la rama de prueba de Neon.
5. Con Docker Desktop iniciado, desde `backend` ejecuta `docker compose up -d --build`.
6. Comprueba `http://localhost:8000/health`, `http://localhost:8000/ready` y `http://localhost:8000/docs`.
7. Si falla, ejecuta `docker compose logs --tail=100 api`.

## Cuentas de prueba
Consulta `CREDENCIALES.md`. Para crear cuentas de demostración **solo en la rama de prueba**, ejecuta `docker compose exec -e ALLOW_DEMO_SEED=true api python -m scripts.seed_demo_accounts`. Nunca habilites estas cuentas en producción.

## Vercel
Configura el directorio raíz en `backend`, instala `DATABASE_URL` y `JWT_SECRET` como variables de entorno en Vercel, y usa el despliegue descrito en README. Verifica el despliegue por separado: no se ha probado contra tu cuenta real.

## Estado
El conjunto de pruebas local existente pasó (8 pruebas). No se ejecutaron pruebas contra Neon real, Docker Desktop ni Vercel. Los módulos marcados como pendientes en README no se deben presentar como terminados para producción.
