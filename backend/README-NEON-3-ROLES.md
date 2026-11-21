# NEXO U — backend anterior + Neon + 3 scripts

Se conserva el backend Docker funcional anterior, sus endpoints y la demo de Camila.

## Neon Console (SQL Editor)
Ejecutar en este orden: `sql/01_base_neon.sql`, `sql/02_roles_usuario_empresa_admin.sql`, `sql/03_permisos_y_sostenibilidad.sql`.

## Docker local conectado a Neon
1. Copiar `.env.example` a `.env`.
2. Pegar DATABASE_URL de Neon y adaptar prefijo `postgresql://` a `postgresql+psycopg://`.
3. Desde `backend/`: `docker compose up --build`.
4. Abrir `http://localhost:8000/` y `http://localhost:8000/docs`.

## Importante: seguridad y alcance
Los 3 scripts crean **roles de aplicación** y las tablas de negocio, pero **NO** agregan todavía autenticación JWT ni controles de acceso por rol a los endpoints antiguos. Esos endpoints son una demo sin login y usan el perfil ficticio ID 1. No desplegar esta API públicamente con datos reales. La demo inserta automáticamente datos ficticios al arrancar y el endpoint `/demo/reset` borra datos de tablas de demo. Para producción, desactivar seed y reset, agregar autenticación JWT, comprobación de propiedad, RLS o permisos equivalentes y migraciones.

`03_permisos_y_sostenibilidad.sql` agrega tablas de campañas y referidos sin ejecutar cobros. La elegibilidad no depende de patrocinios.

## Pruebas
`pytest -q` desde `backend/`. No se ha probado una conexión real a Neon en este entorno.
