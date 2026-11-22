# Nexo U — Frontend

Interfaz React de Nexo U. La landing presenta el proyecto y el área autenticada usa la API para consultar perfiles, oportunidades, matching, credenciales, cursos, becas y finanzas.

## Descripción del trabajo

Nexo U ayuda a estudiantes a entender qué oportunidades pueden encajar con su perfil, qué requisitos cumplen y qué paso pueden dar después. El área estudiantil incluye perfiles escolares y universitarios; sus datos se mantienen separados.

El flujo de cursos conecta inscripción y consulta de estado con el backend. Las empresas con sesión pueden revisar las inscripciones de sus cursos verificados y confirmar la finalización de un estudiante. La credencial y el nuevo resultado de matching se consultan después desde la cuenta estudiantil.

## Flujos conectados

- `/login` y `/register`: inicio de sesión y registro de estudiantes conectados a la API.
- `/recuperar-clave` y `/reset`: solicitud y confirmación de restablecimiento por correo. El servidor debe tener SMTP configurado para enviar el enlace.
- `/app` y `/app/oportunidades`: oportunidades públicas y matching de perfil con requisitos.
- `/app/credenciales`: consultar y declarar habilidades, idiomas y certificados.
- `/app/cursos`, `/app/rutas` y `/app/rutas/ingles-b1`: catálogo público, recomendaciones e inscripciones.
- `/app/oportunidades/becas`: becas abiertas y simulación por perfil escolar; solo muestra bandas oficiales aprobadas.
- `/app/oportunidades/pasantias`: oportunidades de categoría pasantía, ordenadas por compatibilidad.
- `/app/billetera`: movimientos, presupuestos y pagos previstos para estudiantes universitarios de 18 años o más; no se conecta a bancos.
- `/app/configuracion`: cambio de contraseña. Las preferencias visuales todavía no se guardan.
- `/empresa/cursos/validar`: selección de una inscripción pendiente de un curso propio para verificar su finalización.

La landing contiene una tarjeta visual independiente con una oportunidad ficticia y una simulación local 4/5 → 5/5. Esa tarjeta no modifica datos de la API. Dentro de `/app`, el matching y las validaciones vienen de los servicios conectados.

## Datos demo y límites

El backend devuelve `is_demo` para distinguir oportunidades ficticias; las tarjetas las marcan como ejemplos y no las presentan como convocatorias oficiales. La API de producción filtra datos demo. Los resultados de matching y las simulaciones de beca son orientativos y no garantizan aceptación ni adjudicación.

La billetera registra datos ingresados por el estudiante, sin banco ni decisiones crediticias. Las operaciones administrativas de organizaciones y aprobación de reglas de becas cuentan con endpoints en el backend, pero no todas tienen pantalla web.

## Desarrollo local

Desde esta carpeta:

1. Instala dependencias con `npm install`.
2. Inicia Vite con `npm run dev`.
3. Abre la dirección local que indique Vite, normalmente `http://localhost:5173`.

## Configuración de API

El cliente compartido lee `VITE_API_BASE_URL` y acepta `VITE_API_URL` como alias. Si no se define ninguna, usa `http://localhost:8000/api/`. Consulta el contrato frontend/backend en [`../backend/CONTRATO_FRONTEND_v1.4.md`](../backend/CONTRATO_FRONTEND_v1.4.md).

## Estructura

- `src/features/landing/`: landing y demo visual local.
- `src/features/auth/`: acceso, registro y recuperación de contraseña.
- `src/features/company-validation/`: confirmación de cursos para empresas.
- `src/navigation/`: navegación pública y sidebar estudiantil.
- `src/routes/`: rutas públicas, de empresa y del espacio estudiantil.
- `src/features/`: una feature por sección del MVP.
- `src/shared/api/`: cliente HTTP y servicios de autenticación.

Consulta [backend/README.md](../backend/README.md) para configurar la API y las cuentas de demostración.
