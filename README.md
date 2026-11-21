# Nexo U — oportunidades alcanzables

Nexo U es un prototipo estudiantil creado para Abstracthon 2026, en el track Ayuda tecnológica. Combina Educación y Comunicación: organiza oportunidades y requisitos publicados, explica cómo encajan con el perfil de cada estudiante y muestra un siguiente paso posible.

## Problema y propuesta

Las becas, pasantías, cursos y sus requisitos suelen estar repartidos entre páginas y convocatorias distintas. Nexo U propone reunir esa información y ayudar al estudiante a entender:

- Qué requisitos de una oportunidad cumple, cuáles le faltan y por qué.
- Qué curso podría cerrar una brecha entrenable, siempre que la convocatoria acepte la credencial correspondiente.
- Cómo cambia el match cuando el emisor confirma una credencial.

Nexo U orienta y facilita el acceso a oportunidades; no adjudica becas ni garantiza postulaciones exitosas.

## Público y modelo propuesto

El MVP se enfoca en estudiantes universitarios que buscan pasantías y formación vinculada a requisitos concretos. La propuesta contempla como una etapa futura a estudiantes de último año de secundaria que buscan becas.

El acceso del estudiante se plantea como gratuito. Campañas institucionales y referidos de cursos son hipótesis de ingresos que todavía deben validarse con universidades y proveedores; no son acuerdos confirmados. La billetera financiera es un módulo opcional para universitarios adultos, fuera del flujo central de esta demo.

## Qué incluye el prototipo

- **Frontend React:** landing de Nexo U y espacio estudiantil en `/app`, con sidebar para resumen, oportunidades, credenciales, rutas, cursos, perfil y privacidad. La tarjeta principal usa datos locales y simula el paso de 4/5 a 5/5 requisitos; todavía no consulta la API.
- **Backend FastAPI:** API con roles de estudiante, empresa y administración; incluye matching determinista, cursos, credenciales, becas y módulos institucionales.
- **Demostración:** el frontend ilustra localmente el paso de 4/5 a 5/5. El backend demuestra un flujo separado donde un estudiante se inscribe y la institución emisora confirma la credencial.
- **Datos de ejemplo:** los perfiles, oportunidades y cursos usados para la demo son ficticios y deben mostrarse como tales.
- **Acceso:** existen pantallas de registro e inicio de sesión en el frontend, pero su validación es local; no hay autenticación conectada ni persistencia de cuentas.

## Límites actuales

El frontend no está conectado al backend y sus pantallas de acceso no crean sesiones. El backend tiene rutas de autenticación y roles, pero la demo no se conecta a bancos ni representa una integración real con un emisor. Antes de presentar una oportunidad como real, se deben verificar su fuente, requisitos y vigencia.

## Tecnologías

- Frontend: React, Vite y Tailwind CSS.
- Backend: FastAPI, SQLAlchemy y PostgreSQL de Neon.
- Desarrollo y despliegue del backend: Docker Compose y Vercel, según su README.

## Ejecutar

- Frontend: sigue [frontend/README.md](frontend/README.md).
- Backend: sigue [backend/README.md](backend/README.md).

El flujo visual del frontend y la demostración de la API son independientes. La guía del backend explica cómo preparar Neon y recorrer el flujo de roles y validación de credenciales en Swagger.

## Estructura del repositorio

- `frontend/`: landing, espacio estudiantil con sidebar y una feature por ruta, vistas de demostración y pantallas de acceso.
- `backend/`: API, reglas de matching, datos ficticios y configuración Docker.
- `output/pdf/`: documentos de apoyo del proyecto y del evento.

