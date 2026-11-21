# Actualización multiusuario del backend anterior

Se conserva el backend anterior y se añaden endpoints autenticados en `app/api/v1/endpoints/secure_workspace.py`.

## Neon
Ejecuta en SQL Editor los scripts `01_base_neon.sql`, `02_roles_usuario_empresa_admin.sql`, `03_permisos_y_sostenibilidad.sql` y **`04_propiedad_multiusuario.sql`**, en ese orden. Haz copia de seguridad antes de migrar una base existente.

## Docker
Copia `.env.example` a `.env`, configura `DATABASE_URL`, `JWT_SECRET` (>=32 caracteres) y `DEMO_MODE=false`.
Ejecuta `docker compose up -d --build` desde `backend/` y abre `http://localhost:8000/docs`.

## Limitaciones
Este paquete amplía el backend anterior; no es una auditoría de producción. Los endpoints de demo se conservan pero deben permanecer deshabilitados con datos reales. Las finanzas multiusuario, recuperación de contraseña, verificación de correo, límites de tasa, migraciones Alembic completas, políticas RLS para acceso directo, integración de pagos y despliegue Vercel requieren trabajo adicional. No se han probado conexiones reales a Neon.
