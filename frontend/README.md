# Nexo U — Frontend

Interfaz web de Nexo U. Presenta la propuesta pública y ofrece un espacio estudiantil de demostración con sidebar y vistas del MVP.

## Descripción del trabajo

Nexo U ayuda a estudiantes a entender qué oportunidades pueden encajar con su perfil y qué requisito les falta. La tarjeta de demostración muestra una pasantía ficticia con 4 de 5 requisitos cumplidos, sugiere una capacitación para Inglés B1 y permite simular la validación de esa credencial para mostrar el resultado 5/5.

La landing presenta la propuesta y su modelo de privacidad. El espacio estudiantil está disponible en /app. Las pantallas de inicio de sesión y registro están disponibles en /login y /register.

## Alcance actual

- La tarjeta de oportunidad usa datos definidos localmente y cambia de estado en el navegador.
- El botón de validación **simula** la confirmación del curso; no envía una solicitud al backend.
- La oportunidad, el perfil y el curso son ejemplos ficticios, no convocatorias oficiales.
- El sidebar organiza el espacio estudiantil en Resumen, Mi perfil, Oportunidades (todas, becas y pasantías), Preparación (credenciales, rutas y cursos) y Cuenta (billetera opcional, privacidad y configuración).
- Cada destino del sidebar renderiza una feature propia dentro de `src/features/`.
- La vista principal incluye el recorrido de ejemplo 4/5 → curso de Inglés B1 → 5/5. La tarjeta simula la verificación localmente.
- Las vistas de becas y finanzas aclaran que no hay convocatorias oficiales ni conexión bancaria configuradas.
- El registro e inicio de sesión validan campos localmente, pero no crean cuentas ni guardan credenciales.
- El cliente API compartido está preparado para solicitudes futuras; las pantallas descritas arriba todavía no se conectan al flujo de matching del backend.

## Desarrollo local

Desde esta carpeta:

1. Instala dependencias con `npm install`.
2. Inicia Vite con `npm run dev`.
3. Abre la dirección local que indique Vite, normalmente `http://localhost:5173`.

## Espacio estudiantil

Abre `/app` para entrar al panel de demostración. Las secciones del sidebar llevan a sus vistas y subsecciones; la ruta `/app/rutas/ingles-b1` abre el detalle del curso de ejemplo. No hay autenticación real y la landing no consulta el backend.

## Configuración de API

El cliente compartido lee `VITE_API_BASE_URL`. Si no se define, usa `http://localhost:8000/api/`. Para el flujo actual de la tarjeta no es necesario iniciar el backend porque la interacción es local.

## Estructura

- `src/features/landing/`: landing, secciones informativas y datos de la tarjeta demo.
- `src/features/auth/`: interfaces de inicio de sesión y registro.
- `src/navigation/components/`: navegación pública y sidebar estudiantil.
- `src/routes/`: rutas públicas y mapa de rutas del espacio estudiantil.
- `src/features/summary/`, `profile/`, `opportunities/`, `scholarships/`, `internships/`, `credentials/`, `learning-paths/`, `course-detail/`, `courses/`, `wallet/`, `privacy/` y `settings/`: una feature por ruta estudiantil.
- `src/features/student-app/`: estructura compartida del espacio estudiantil.
- `src/shared/api/`: cliente HTTP compartido.
- `src/shared/components/`: componentes de marca.

El backend y su demo de matching se describen en [backend/README.md](../backend/README.md).
