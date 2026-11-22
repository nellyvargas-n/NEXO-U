# API NEXO U v1.4 — Contrato para React

API local: `http://localhost:8000/api/v1`.

## Público

- `GET /oportunidades/publicas`: array de oportunidades vigentes de organizaciones verificadas; incluye `is_demo` para etiquetar muestras ficticias.
- `GET /cursos/publicos`: incluye `credential_level` y `organization`.
- `GET /meta`: versiones y endpoints.

## Autenticación

- `POST /auth/register` JSON `email,password,role` (`usuario` o `empresa`).
- `POST /auth/login` JSON `email,password`; devuelve `access_token`, `token_type=bearer`, `role`.
- `GET /auth/me`: enviar `Authorization: Bearer <token>`.
- `POST /auth/cambiar-clave`: actual y nueva. Revoca tokens anteriores.
- `POST /auth/recuperar-clave/solicitar` JSON `email` — requiere SMTP, respuesta genérica 202.
- `POST /auth/recuperar-clave/confirmar` JSON `token,new_password` — token de un uso; revoca tokens anteriores.

## Usuario

- `GET /usuario/dashboard`, `GET/PUT /usuario/perfil`, `GET/PUT /usuario/escolar/perfil`.
- `GET/POST /usuario/credenciales`, `GET /usuario/match`, `GET /usuario/rutas`.
- En `match`, cada `requirement` incluye `kind`, `operator`, `required`, `required_level`, `status`, `courses` (rutas sugeridas).
- `GET /usuario/inscripciones`, `POST /usuario/cursos/{course_id}/inscribir`.
- Finanzas privadas solo para usuarios universitarios adultos.

## Empresa

- `GET /empresa/dashboard`, `GET/POST /empresa/organizaciones`, `GET/POST /empresa/cursos`, `GET/POST /empresa/oportunidades`.
- `GET /empresa/cursos/{course_id}/inscripciones`: solamente sus alumnos, `student_user_id`, `student_name`, `validation_status`.
- `POST /empresa/cursos/{course_id}/validar` JSON `student_user_id`.

## Admin

- `GET /admin/dashboard`, `GET /admin/usuarios`, `PATCH /admin/organizaciones/{org_id}/verificacion`, etc.

Un 401 indica sesión no válida; 403 indica rol insuficiente; 404 indica perfil/registro no disponible. Los resultados de becas son orientativos, no garantizan la adjudicación.
