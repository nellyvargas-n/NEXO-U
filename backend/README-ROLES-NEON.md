# NEXO U — Backend original + 3 roles reales

Se conserva la arquitectura y los endpoints de demo originales. Se añaden registro/login JWT, roles y rutas protegidas.

## Neon SQL Editor
Ejecutar **en orden** `sql/01_base_neon.sql`, `sql/02_roles_usuario_empresa_admin.sql`, `sql/03_permisos_y_sostenibilidad.sql`. No volver a ejecutar scripts destructivos ni guardar contraseñas en SQL.

## Variables
Copia `.env.example` a `.env`. Ajusta `DATABASE_URL` (usa `postgresql+psycopg://...`), `JWT_SECRET` (genera con `python -c "import secrets; print(secrets.token_urlsafe(48))"`) y `DEMO_MODE=false` cuando conectes datos reales. Nunca subas `.env`.

## Docker
Desde `backend`: `docker compose up --build`. Verifica `http://localhost:8000/health` y `/docs`.

## Primer administrador
Con Docker ejecutándose: `docker compose exec api python scripts/create_admin.py admin@ejemplo.com` y escribe una contraseña robusta. El registro público solo permite `usuario` y `empresa`.

## Flujo en Swagger
1. `POST /api/v1/auth/register` con `role: usuario` o `empresa`.
2. `POST /api/v1/auth/login` con email y contraseña.
3. Copia `access_token`, pulsa **Authorize** (Bearer) en Swagger y pega el token.
4. `GET /api/v1/auth/me` y `GET /api/v1/usuario/panel` o `POST /api/v1/empresa/organizaciones`.
5. El administrador puede listar usuarios, activar/desactivar y verificar organizaciones.

## Seguridad y límites
- Roles en **app_users** son roles de aplicación, no roles SQL de PostgreSQL. La autorización la comprueba FastAPI; las tablas NO tienen RLS integral por usuario.
- Los endpoints históricos `/api/v1/profiles/me`, `/api/v1/credentials`, `/api/v1/match`, `/api/v1/finance/reach`, `/api/v1/courses/{id}/complete`, `/api/v1/demo/reset` son DEMO y se deshabilitan con `DEMO_MODE=false`. No se han migrado a datos multiusuario. Los endpoints públicos de oportunidades y cursos muestran datos de catálogo.
- Para producción falta migrar matching, finanzas y validaciones a identidad del usuario; aplicar migraciones, políticas de privacidad y pruebas de integración con Neon.
- `Base.metadata.create_all` y el sembrado automático solo se ejecutan en `DEMO_MODE=true`. En Neon usa los SQL proporcionados.
- No uses credenciales reales de estudiantes menores ni datos financieros reales en esta versión.
