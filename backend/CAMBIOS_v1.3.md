# Cambios reales de NEXO U — backend v1.3

Versión construida sobre el `backend.zip` recibido.

## Corregido

- `.env.example`: se eliminaron marcas de conflicto de Git y cualquier clave de conexión antigua.
- Se conservaron las rutas existentes de los tres roles, perfiles, becas, cursos,
  inscripciones, finanzas y matching escolar/universitario.
- Los módulos `app/models/*.py` antes vacíos reexportan los modelos ORM existentes,
  **sin crear tablas duplicadas**.
- Los módulos `app/schemas/*.py` ahora incluyen contratos Pydantic tipados.
- Los módulos `app/services/*.py` incorporan consultas y funciones reutilizables.
- Los archivos de endpoints auxiliares apuntan a sus funciones reales y no
  registran las mismas rutas dos veces.

## Añadido

- Orientación educativa local (FAQ) sin usar IA generativa ni datos privados.
- Rutas de cursos en función de requisitos no cumplidos, preservando `operator`,
  `required_level` y la fecha límite de la oportunidad.
- Cliente Gemini **opcional**: solo texto público, nunca decide elegibilidad.
- Configuración Alembic con línea base **NO DESTRUCTIVA** para futuras revisiones.
- Nuevas pruebas de autorización, rutas, reglas de cursos y seguridad de plantillas.

## Limitaciones explícitas

- El esquema PostgreSQL sigue siendo **v1.2**. Si `/ready` ya estaba listo, no hace falta SQL.
- No se ha comprobado una ejecución con la Neon privada del usuario.
- No se ha recibido ni modificado el frontend React.
- El código de IA generativa no está conectado por defecto ni probado contra Gemini.
- Requiere mejoras adicionales antes de una publicación para usuarios reales
  (verificación de correo, recuperación, límites de solicitudes, pruebas en Neon, etc.).
