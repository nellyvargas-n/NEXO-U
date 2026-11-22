# VERSIÓN v1.2 — Actualización del contrato React/Neon

Lee **`INTEGRACION_FRONTEND_v1.2.md`** antes de hacer cambios en Neon. Incluye el script **`sql/05_integracion_escolar_neon.sql`** para bases existentes, las nuevas rutas de colegios y la siembra opcional de oportunidades para demo. **No borres tus tablas antiguas**.

---

> **Versión de mejoras 1.1:** revisión de permisos, CORS, cambio de contraseña con revocación de JWT, validación de criterios de matching, rutas React `/api/v1/{rol}/dashboard`, `/README.md`, `sql/00_REVISAR_ANTES_DE_INSTALAR.sql`, `sql/02_COMPROBAR_DESPUES.sql`. No contiene contraseñas. Lee `INICIO_AQUI.md` antes de ejecutar SQL en Neon.

# NEXO U — Backend ampliado con Neon PostgreSQL

**FastAPI + PostgreSQL Neon + Docker + Vercel.** Se conservó la estructura del backend previo, se reforzaron los 3 roles (`usuario`, `empresa`, `admin`) y se añadieron módulos reales para la propuesta de billetera estudiantil.

## 1. Neon Console: crea la base de datos

Entra en https://console.neon.tech/ , abre tu proyecto y el menú **SQL Editor**.

1. Abre `backend/sql/NEON_CONSOLE_TODO.sql` (es el script unificado).
2. Copia **todo el contenido**, pégalo en SQL Editor y pulsa **Run**.
3. Opcional: ejecuta `backend/sql/NEON_CONSOLE_VERIFICAR.sql` para consultar las tablas y controles.
4. En **Connect**, copia la cadena PostgreSQL (para Vercel preferir la URL pooled). **No publiques esa URL**.

Si ya ejecutaste los scripts antiguos 01 a 04, también puedes ejecutar el script unificado: crea las tablas faltantes con `IF NOT EXISTS` y aplica la ampliación. **Haz una copia de seguridad/branch de Neon antes** de aplicar cambios en una base con datos importantes. Los scripts antiguos se dejan como referencia; sobre una nueva base usa solo el script unificado.

Los 3 roles son de **aplicación JWT**, no superusuarios PostgreSQL.

## 2. Preparar configuración

En PowerShell, desde `NEXO-U/backend`:

```powershell
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Pega tu URL real de Neon y la clave aleatoria generada en `.env`:

```env
DATABASE_URL=postgresql+psycopg://USUARIO:CONTRASENA@HOST-POOLER/neondb?sslmode=require
JWT_SECRET=PEGA_AQUI_CLAVE_ALEATORIA_DE_48_CARACTERES_O_MAS
DEMO_MODE=false
CORS_ORIGINS=http://localhost:5173
```

Si copias `postgresql://` de Neon, el backend lo convierte automáticamente a `psycopg` 3. Usa una sola URL de la base Neon del proyecto; no pongas secretos en archivos rastreados por Git.

## 3. Levantar con Docker

Abre Docker Desktop, después en la terminal VS Code:

```powershell
cd backend
# Si ya estás en backend, omite cd

docker compose up -d --build
docker compose ps
docker compose logs --tail=50 api
```

Prueba estas URL en tu computadora:

- `http://localhost:8000` — página de bienvenida (no es React)
- `http://localhost:8000/docs` — Swagger (registro, login, roles, finanzas, becas...)
- `http://localhost:8000/health` — servidor vivo
- `http://localhost:8000/ready` — conexión a Neon y existencia de las tablas

La API por defecto **NO crea tablas automáticamente en Neon**: debes ejecutar el SQL en Neon Console. Esto evita modificar accidentalmente una base real. Para ejecutar tests sin Neon: `python -m pytest -q` usa una base SQLite temporal aislada.

## 4. Credenciales de prueba: archivos `.m` y `.md`

El ZIP incluye **ambos formatos exactos**: `backend/CREDENCIALES.m` y `backend/CREDENCIALES.md`. Contienen correos y contraseñas **aleatorios de demostración** (no contraseñas de tu proyecto Neon).

**Estas cuentas aún no existen en tu Neon**, hasta que ejecutes explícitamente este comando, únicamente sobre una **base de pruebas**:

```powershell
docker compose exec -e ALLOW_DEMO_SEED=true api python -m scripts.seed_demo_accounts
```

El comando crea estudiante, empresa, administrador y un segundo usuario escolar (el último sigue usando el rol `usuario`), además del caso ficticio de Camila. No reemplaza contraseñas de cuentas existentes.

No publiques los archivos de credenciales. Están ignorados por `.gitignore`. En Docker de desarrollo se incluyen para ejecutar el seeder: no publiques esa imagen Docker ni la reutilices en producción sin excluir `credenciales/`. Para crear un administrador real sin contraseñas en el código:

```powershell
docker compose exec -it api python -m scripts.create_admin tu_correo@dominio.com
```

Si prefieres no crear cuentas demo, registra usuario y empresa con `POST /api/v1/auth/register` y crea el primer admin mediante el script de administración.

## 5. Cómo probar los 3 roles en Swagger

Abre `/docs`. Selecciona `POST /api/v1/auth/login`, introduce correo y contraseña del archivo de credenciales, pulsa **Execute**, copia `access_token`, pulsa **Authorize** y pégalo como Bearer. Vuelve a iniciar sesión para probar cada rol.

### Usuario / estudiante

- `GET /api/v1/auth/me` — consultar sesión y rol
- `PUT /api/v1/usuario/perfil` — perfil universitario
- `PUT /api/v1/usuario/escolar/perfil` — perfil escolar (alternativo al universitario)
- `POST /api/v1/usuario/credenciales` — credenciales declaradas
- `GET /api/v1/usuario/match` — matching por criterios (4/5)
- `POST /api/v1/usuario/cursos/{id}/inscribir` — inscripción
- `GET /api/v1/usuario/inscripciones` — inscripciones propias
- `GET /api/v1/usuario/becas/{id}/simular` — bandas solo con reglas oficiales y aprobadas
- `GET /api/v1/usuario/finanzas/resumen` — finanzas **solo de adultos** y sin acceso empresarial
- `POST/GET /api/v1/usuario/finanzas/movimientos` — transacciones privadas
- `PUT/GET /api/v1/usuario/finanzas/presupuestos` — presupuestos
- `POST/GET /api/v1/usuario/finanzas/obligaciones` — pagos previstos
- `GET /api/v1/notificaciones` — notificaciones propias
- `DELETE /api/v1/usuario/billetera` — borrar datos de billetera manteniendo cuenta

### Empresa / universidad / formador

- `POST /api/v1/empresa/organizaciones` — crear organización (no queda verificada)
- `POST/GET /api/v1/empresa/oportunidades` — gestionar oportunidades de la organización verificada
- `POST /api/v1/empresa/oportunidades/{id}/requisitos` — requisitos estructurados
- `POST/GET /api/v1/empresa/cursos` — publicar formación
- `POST /api/v1/empresa/cursos/{id}/validar` — confirmar **solo alumnos inscritos en cursos propios**
- `PUT /api/v1/empresa/becas/{id}/bandas` — proponer bandas con URL oficial
- `POST/GET /api/v1/empresa/campanas` — campañas transparentes
- `POST/GET /api/v1/empresa/referidos/acuerdos` — acuerdos de comisión divulgados
- `GET /api/v1/empresa/estadisticas?organization_id=...` — agregados, sin saldos ni perfiles individuales
- `POST /api/v1/empresa/eventos` — eventos de organizaciones verificadas

### Administrador

- `GET /api/v1/admin/usuarios` — lista de cuentas
- `PATCH /api/v1/admin/usuarios/{id}` — activar/desactivar
- `GET /api/v1/admin/organizaciones` — organizaciones
- `PATCH /api/v1/admin/organizaciones/{id}/verificacion` — verificar emisor
- `PATCH /api/v1/admin/becas/bandas/{id}/revisar` — aprobar reglas oficiales
- `PATCH /api/v1/admin/referidos/acuerdos/{id}` — activar acuerdos transparentes
- `GET /api/v1/admin/resumen` — indicadores generales
- `GET /api/v1/admin/auditoria` — trazas de cambios relevantes

Rutas públicas: `/api/v1/oportunidades/publicas`, `/api/v1/cursos/publicos`, `/api/v1/eventos`, `/api/v1/comunidad/publicaciones`. Community requiere autenticación para publicar y permite moderación de contenidos.

## 6. Caso demostrable: 4/5 → 5/5

Después de ejecutar el seeder:

1. Inicia sesión con `estudiante@nexou.demo` → `GET /api/v1/usuario/match`: Camila cumple 4/5; le falta Inglés B1.
2. Inscríbete al curso B1 con `POST /api/v1/usuario/cursos/{course_id}/inscribir`.
3. Inicia sesión con `empresa@nexou.demo` → `POST /api/v1/empresa/cursos/{course_id}/validar` con JSON `{"student_user_id": ID_DEL_ESTUDIANTE}` (el seeder muestra los IDs).
4. Vuelve a iniciar sesión con estudiante → `GET /api/v1/usuario/match`: 5/5 y credencial verificada.

**Las oportunidades de la demo son ficticias**, siempre etiquetadas como tales. Para presentar al jurado usa convocatorias reales y fuentes oficiales. El matching es determinista, no decisión de IA.

## 7. Publicar en Vercel

La raíz del proyecto en Vercel debe ser **`backend`**, que contiene `app.py`, `requirements.txt` y `pyproject.toml`. Vercel reconoce FastAPI. Ajusta estas variables en Vercel → Settings → Environment Variables:

- `DATABASE_URL` = URL pooled de Neon (no pegar en React)
- `JWT_SECRET` = clave larga aleatoria (igual para todas las instancias de este despliegue)
- `DEMO_MODE` = `false`
- `CORS_ORIGINS` = URL HTTPS exacta del frontend, p.ej. `https://tu-app.vercel.app`

Después prueba `https://tu-backend.vercel.app/ready` y `/docs`. El script de cuentas demo solo debe ejecutarse localmente o en infraestructura de desarrollo, nunca desde un endpoint público.

## 8. Privacidad, límites y estado real

- El backend usa **JWT + permisos en la API y comprobaciones de propiedad**. Los datos financieros están aislados por usuario, y los escolares no tienen módulo financiero.
- `NEON_CONSOLE_TODO.sql` aplica **RLS FORCE a tablas financieras**. Para que PostgreSQL lo imponga, usa un rol de aplicación **SIN BYPASSRLS**; la cuenta `neondb_owner` de Neon normalmente puede saltarse RLS. Hay un script opcional `NEON_CONSOLE_GRANTS_ROL_APP.sql` para otorgar privilegios a un rol normal ya creado en Neon. Si usas `neondb_owner`, las comprobaciones JWT y de propiedad de FastAPI siguen operando, pero **no debes anunciar aislamiento RLS de base de datos garantizado**.
- Neon pooled usa transacciones, y para finanzas la API inyecta `nexou.user_id` mediante `set_config(..., true)` dentro de la transacción. Nunca otorgar acceso directo al navegador ni permitir configurar el usuario por una cabecera libre.
- No hay pagos reales, transferencias ni conexiones bancarias: fuera del alcance de las propuestas. El módulo de sostenibilidad registra campañas, referidos y comisiones **acordadas**, pero no procesa dinero ni afirma ingresos reales.
- No hay importación automática de boletines/lectura IA de CV ni garantías de beca: son mejoras futuras según la propuesta. Las reglas de beca deben quedar aprobadas por un administrador antes de estimar bandas.
- Antes de exponerlo a usuarios reales, faltan pruebas de integración en tu Neon, correo verificado, recuperación de contraseña, protección contra abuso/rate limiting, análisis de seguridad y monitoreo externo. Las pruebas locales pasan sobre SQLite; **no equivalen a un despliegue probado**.

## 9. Estructura conservada

Se conserva el backend anterior con `app/core`, `app/api/v1`, `app/models`, `app/services`, `app/repositories`, `app/schemas`, `app/ai`, `tests`, `Dockerfile`, `docker-compose.yml` y se añaden los módulos `extended.py`, `student_features.py`, `institution_features.py`, `community_features.py` y `scripts/seed_demo_accounts.py`. Algunos archivos heredados de futuras integraciones (p. ej. `firebase.py`, `gemini_client.py`, repositorios antiguos) son auxiliares o marcadores, **no se anuncian como integraciones activas**. La API funcional está registrada en `/docs`.
