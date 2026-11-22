# Cambios v1.4 sobre el backend v1.3

- Nuevas tablas independientes `auth_attempts` y `password_reset_tokens` (SQL `07` y Alembic `20261122_02`). No borran ni alteran datos v1.2.
- JWT existente con rotación de sesión; recuperación por SMTP opcional con token de un solo uso y validez limitada.
- Limitación persistente en DB de intentos de login por IP+cuenta (5 en 5 min), solicitudes de recuperación (3 en 15 min) y registros por IP (100 en 15 min). WAF/infraestructura para seguridad de producción sigue siendo recomendable.
- Documentación Vercel actualizada con `index.py`, dos proyectos independientes y variables de entorno.
- Comprobación `/ready` de esquema v1.4, script de diagnóstico `scripts/smoke_api.py`.
- Pruebas reales en los 11 módulos que estaban vacíos: autenticación, roles, perfiles, credenciales, oportunidades, cursos, validación, finanzas, comunidad, IA de reglas, y contratos del frontend.
- Frontend React v2.1 con flujo de recuperar contraseña, pantalla de confirmación y despliegue SPA para `/reset`.

## Límites explícitos

No se han enviado correos reales (hace falta SMTP), desplegado Vercel, auditado el historial Git, validado la base Neon del usuario ni confirmado compilación Vite con npm. Los datos demo son ficticios. El registro público no permite crear administradores.
