# NEXO U — Backend v1.4 (Neon, FastAPI y JWT)

Este backend conserva el esquema Neon v1.2, los tres roles y los endpoints del frontend. La ampliación **v1.4** añade recuperación de contraseña por correo opcional, limitación de intentos de acceso y pruebas de integración de contratos.

## Instalación en la base Neon que ya tienes

No borres ni recrees tablas. **En tu rama de pruebas `prueba-v12`**, ejecuta únicamente el script aditivo `sql/07_seguridad_v14.sql` y comprueba con `sql/08_comprobar_v14.sql`. Después configura el nuevo `.env` local y ejecuta:

```powershell
cd backend
docker compose up -d --build
python -m scripts.smoke_api
```

En `http://localhost:8000/ready` debe aparecer `database: connected`, `schema: v1.4`. `http://localhost:8000/docs` muestra Swagger.

## Seguridad y credenciales

El archivo `.env.example` es solo plantilla, **no** una contraseña. Copia a `.env` y configura tu `DATABASE_URL` actual y un `JWT_SECRET` nuevo. Cambia las credenciales de Neon y JWT anteriormente mostradas públicamente. Nunca las subas a GitHub. La API nunca comparte contraseñas Neon con React.

Para recuperar claves mediante correo, configura `SMTP_HOST`, `SMTP_FROM` y datos del proveedor en el servidor. Si no están configurados, el endpoint devuelve 503 y la interfaz informa que el servicio no está activo. Los tokens de recuperación se almacenan solo como hashes, vencen y son de un solo uso.

## Demo y pruebas

Solo en una rama de pruebas puedes usar `docker compose exec -e ALLOW_DEMO_SEED=true api python -m scripts.seed_demo_accounts`. Esto crea cuentas, oportunidades y cursos **ficticios**. No son convocatorias oficiales y quedan filtrados en `ENVIRONMENT=production`.

Pruebas sin usar Neon:

```powershell
python -m pip install -r requirements.txt
python -m pytest -q
```

Consulta el `README.md` de la raíz del ZIP para instalación del frontend y Vercel. Usa `alembic/README.md` si eliges migraciones versionadas en vez del SQL Editor. **No ejecutes ambos métodos para la misma revisión.**
