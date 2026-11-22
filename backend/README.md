# NEXO U — Backend v1.3

**FastAPI + PostgreSQL Neon + JWT (3 roles) + Docker.** Esta versión mejora
el `backend.zip` recibido y conserva los endpoints y el esquema Neon **v1.2**.

## Instrucciones rápidas para quien ya tiene Neon conectado

**Si `/ready` ya mostraba `database: connected` y `schema: v1.2`, NO borres tablas,
NO vuelvas a ejecutar scripts SQL y NO crees otra base.**

1. Guarda por separado tu `backend/.env` privado (nunca lo subas a GitHub).
2. Descomprime este ZIP y reemplaza solamente la carpeta `backend` anterior,
   conservando el frontend React.
3. Copia tu `.env` privado al nuevo `backend/`.
4. En VS Code abre una terminal en `backend` y ejecuta:

   ```powershell
   docker compose down
   docker compose up -d --build
   docker compose ps
   ```

5. Comprueba `http://localhost:8000/ready` y abre `http://localhost:8000/docs`.
6. React sigue en `http://localhost:5173` (terminal dentro de frontend: `npm run dev`).

**Contraseñas:** la plantilla `.env.example` contiene solo valores de ejemplo.
Neon `DATABASE_URL` y `JWT_SECRET` deben estar en `.env` local y cambiarse si
alguna vez se mostraron en una captura o chat.

## Rutas principales

- Autenticación: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`,
  `GET /api/v1/auth/me`, `POST /api/v1/auth/cambiar-clave`.
- **Usuario:** `GET/PUT /api/v1/usuario/perfil`, perfil escolar alternativo,
  credenciales, `GET /api/v1/usuario/match`, inscripciones, becas y finanzas
  privadas para universitarios adultos.
- **Empresa:** publica oportunidades/cursos, consulta inscritos **solo en sus
  propios cursos**, valida credenciales, registra campañas y eventos.
- **Admin:** administra usuarios, verifica organizaciones y supervisa auditoría.
- Catálogos: `GET /api/v1/oportunidades/publicas` y `/api/v1/cursos/publicos`.
- **Nuevas rutas de v1.3:** `GET /api/v1/asistente/estado`,
  `POST /api/v1/usuario/asistente/preguntar`, `GET /api/v1/usuario/rutas`,
  `GET /api/v1/usuario/match/resumen`.

La IA de orientación funciona **localmente con reglas**. No lee documentos,
no cambia resultados del matching ni determina si se concede una beca.
El cliente Gemini es **opcional y desactivado sin clave**, solo para textos
públicos y no conectado automáticamente a la API.

## Pruebas locales sin tocar Neon

```powershell
python -m pip install -r requirements.txt
python -m pytest -q
```

Las pruebas usan SQLite temporal aislada. No demuestran que ya se haya probado
una conexión real con TU Neon o con el frontend.

## Migraciones

- Rama nueva de Neon: scripts base en `sql/` (solo si necesitas una base vacía).
- Neon existente v1.2: **no ejecutes más SQL** para instalar este ZIP.
- `alembic/` tiene una línea base v1.2 **sin CREATE/DROP** para futuras
  migraciones; lee `alembic/README.md` antes de usarla.

## Documentación de apoyo

- `INICIO_AQUI.md`: instrucciones para reemplazar el backend sin perder `.env`.
- `CONTRATO_FRONTEND_v1.3.md`: endpoints y permisos para React.
- `CAMBIOS_v1.3.md`: cambios reales frente al ZIP original.
- `CREDENCIALES_EJEMPLO.md`: cómo generar cuentas **ficticias de prueba**
  sin incrustar contraseñas en el código.

### Estado y límites

Para producción todavía hacen falta verificaciones de correo, recuperación de
contraseña, limitación de solicitudes, auditoría y pruebas de integración
contra una rama Neon. No se incluyen pagos o transferencias reales, lectura OCR
de boletines ni IA que decida becas; esa automatización tampoco forma parte
del MVP aprobado.
