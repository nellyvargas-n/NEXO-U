# Fuente de los datos mostrados en NEXO U

El frontend **no utiliza Neon directamente**. Todas las consultas van a FastAPI en la ruta base `/api/v1` con el proxy local.

| Vista | Fuente real FastAPI | Notas |
|---|---|---|
| Catálogo público | `GET /api/v1/oportunidades/publicas` | Solo convocatorias vigentes que el backend expone. |
| Cursos públicos | `GET /api/v1/cursos/publicos` | Sin cursos ficticios. |
| Matching del estudiante | `GET /api/v1/usuario/match` | Requiere sesión y perfil. |
| Perfil universitario/escolar | `GET /api/v1/usuario/perfil`, `GET /api/v1/usuario/escolar/perfil` | Cuenta propia. |
| Credenciales | `GET/POST /api/v1/usuario/credenciales` | Datos propios, verificación por el emisor. |
| Inscripciones | `GET /api/v1/usuario/inscripciones`, `POST /api/v1/usuario/cursos/{id}/inscribir` | Perfiles universitarios y escolares. |
| Guardados | `GET /api/v1/usuario/guardados`, `PUT/DELETE /api/v1/usuario/guardados/{id}` | Guardado persistente; no localStorage. |
| Notificaciones | `GET /api/v1/notificaciones`, `PATCH /api/v1/notificaciones/{id}/leer` | Notificaciones de la cuenta. |
| Cambio de contraseña | `POST /api/v1/auth/cambiar-clave` | Revoca los tokens existentes. |
| Billetera | `/api/v1/usuario/finanzas/*` | Solo universitarios adultos, privado. |
| Empresa | `/api/v1/empresa/organizaciones`, `/api/v1/empresa/cursos`, `/api/v1/empresa/oportunidades`, `/api/v1/empresa/oportunidades/{id}/requisitos` | Requiere rol empresa; publicación exige verificación. |
| Empresa inscripciones | `GET /api/v1/empresa/cursos/{id}/inscripciones`, `POST /api/v1/empresa/cursos/{id}/validar` | Solo su curso. |
| Admin | `/api/v1/admin/usuarios`, `/api/v1/admin/organizaciones`, `/api/v1/admin/resumen` | Requiere rol admin. |

**Sin datos:** la interfaz muestra un mensaje explicativo y no inventa instituciones, becas, estadísticas, postulaciones ni fechas.
| Recuperación de acceso | `POST /api/v1/auth/recuperar-clave/solicitar`, `POST /api/v1/auth/recuperar-clave/confirmar` | Envío de correo solo cuando SMTP está configurado; el token es de un solo uso. |
