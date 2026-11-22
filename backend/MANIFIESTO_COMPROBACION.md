# Verificación del backend NEXO U v1.3

- Basado en `backend.zip` aportado por el usuario.
- Archivos modificados respecto al original: **89**.
- Archivos nuevos: **9** (sin contar este manifiesto).
- Pruebas Python automatizadas: **28 pasaron**, ejecutadas sobre SQLite temporal.
- Sintaxis Python comprobada con `compileall`.
- Alembic baseline identificado: `20261122_01`.
- `.env` real, contraseñas y archivos locales de credenciales: **no incluidos**.
- La migración Neon v1.2 existente se conserva, no se ejecutó contra Neon.
- No se pudo iniciar Docker en este entorno: esa comprobación se hace en la computadora del usuario.
- El frontend React no se incluyó ni fue modificado.

## Rutas nuevas

- `GET /api/v1/asistente/estado`
- `POST /api/v1/usuario/asistente/preguntar`
- `GET /api/v1/usuario/rutas`
- `GET /api/v1/usuario/match/resumen`

## Cambios funcionales

Además de corregir `.env.example` y la documentación, se implementaron
módulos de orientación educativa local, servicios SQLAlchemy reutilizables,
contratos Pydantic, importaciones de modelos reales y la base Alembic
no destructiva. La elegibilidad sigue siendo determinista.

## Límites

La conexión privada a Neon, Vercel y la integración con el frontend todavía
requieren comprobación en la infraestructura del usuario. No afirmar que
el sistema está listo para producción solo por superar pruebas locales.
