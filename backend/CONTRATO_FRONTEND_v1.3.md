# Contrato NEXO U frontend ↔ backend v1.3

**Origen de desarrollo:** `http://localhost:8000/api/v1`
**Frontend:** `http://localhost:5173` (configurado en `CORS_ORIGINS`).

## Inicio de sesión

- `POST /auth/register` — JSON `{"email":"...","password":"...","role":"usuario"|"empresa"}`
- `POST /auth/login` — devuelve `access_token`, `token_type: bearer`, `role`.
- Rutas privadas — enviar `Authorization: Bearer <token>`.
- `GET /auth/me` — perfil de la cuenta; no devuelve el hash de contraseña.

## Estudiante

- `GET /usuario/dashboard` — resumen de la cuenta.
- `PUT /usuario/perfil` — perfil universitario.
- `PUT /usuario/escolar/perfil` — perfil escolar (excluyente).
- `GET/POST /usuario/credenciales` — propias, para ambos perfiles.
- `GET /usuario/match` — oportunidades con `requirements[]`, cada requisito
  incluye `operator`, `required`, `required_level` (por ejemplo, Inglés B1),
  `status` y `courses[]` sugeridos.
- `GET /usuario/rutas` — devuelve rutas separadas, listas para mostrar en tarjetas.
- `GET /usuario/match/resumen` — resultado explicado; no es una admisión oficial.
- `GET/POST /usuario/inscripciones` / `POST /usuario/cursos/{id}/inscribir` — inscripciones.
- `POST /usuario/asistente/preguntar` — pregunta breve, respuestas FAQ locales.

## Empresa

- `GET /empresa/dashboard`
- `GET /empresa/cursos` — incluye `credential_level`.
- `GET /empresa/cursos/{course_id}/inscripciones` — alumnos de un curso propio.
- `POST /empresa/cursos/{course_id}/validar` — solo emisor del curso.

## Administración

- `GET /admin/dashboard`
- `GET /admin/usuarios` y `PATCH /admin/organizaciones/{id}/verificacion`.

## Públicas

- `GET /oportunidades/publicas` solo muestra oportunidades vigentes de
  organizaciones verificadas. Puede devolver lista vacía si no hay datos cargados.
- `GET /cursos/publicos` también filtra emisores y vigencia.
- `GET /meta`, `GET /asistente/estado`.

**Nota:** las oportunidades de los scripts demo son ficticias y se etiquetan con
`is_demo`. No trates una compatibilidad escolar como beca adjudicada.
