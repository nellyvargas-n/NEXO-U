# Nexo U — oportunidades alcanzables

Nexo U es un prototipo estudiantil de Abstracthon 2026, en el track Ayuda tecnológica. Reúne oportunidades, requisitos y cursos para ayudar a estudiantes a entender qué cumplen, qué les falta y cuál podría ser su siguiente paso.

Nexo U orienta y facilita el acceso a oportunidades; no adjudica becas, no selecciona postulantes y no garantiza resultados.

## Público y propuesta

El prototipo admite perfiles escolares y universitarios, con datos académicos separados. Los perfiles escolares pueden consultar becas y simular bandas únicamente cuando la institución ha publicado reglas oficiales aprobadas por administración. El matching también explica requisitos de pasantías y sugiere cursos públicos cuando hay una credencial que puede cubrirlos.

El acceso del estudiante se plantea como gratuito. Campañas institucionales y referidos de cursos son hipótesis de ingresos que todavía deben validarse con universidades y proveedores. La billetera es opcional y está limitada a estudiantes universitarios adultos.

## Funcionalidades implementadas

- **Autenticación:** registro e inicio de sesión de estudiantes conectados al backend; recuperación y cambio de contraseña mediante los endpoints disponibles. La recuperación por correo requiere SMTP configurado.
- **Espacio estudiantil (`/app`):** resumen con oportunidades públicas y matching; perfil escolar o universitario; credenciales; catálogo e inscripción a cursos; rutas sugeridas; becas; pasantías; y billetera financiera para universitarios de 18 años o más.
- **Validación de cursos:** el portal `/empresa/cursos/validar` lista cursos propios de organizaciones verificadas y sus estudiantes inscritos. La empresa elige una inscripción pendiente para confirmar la finalización; el backend registra la credencial verificada.
- **Becas:** la simulación solo presenta bandas oficiales aprobadas y es orientativa. Si no existen reglas aprobadas, no inventa un porcentaje.
- **Privacidad financiera:** los movimientos, presupuestos y pagos previstos se guardan en la cuenta del estudiante; no hay conexión bancaria.
- **Demo de portada:** la tarjeta visual 4/5 → 5/5 de la landing sigue siendo una demostración local separada del matching real dentro de `/app`.

## Datos y límites

Las oportunidades ficticias se identifican con `is_demo` y la interfaz las etiqueta como ejemplos. Las oportunidades reales requieren una organización verificada, una fecha vigente y una fuente oficial comprobable. La disponibilidad de una beca, la elegibilidad calculada y la validación de un curso no garantizan admisión ni adjudicación.

La administración de organizaciones y la aprobación de reglas de becas tienen endpoints protegidos en el backend; no todas las operaciones administrativas cuentan con una pantalla web. La billetera no se conecta a bancos ni ofrece asesoramiento financiero. Las preferencias visuales de cuenta aún no se guardan.

## Tecnologías

- Frontend: React, Vite y Tailwind CSS.
- Backend: FastAPI, SQLAlchemy y PostgreSQL de Neon.
- Desarrollo y despliegue del backend: Docker Compose y Vercel, según su documentación.

## Ejecutar

- Frontend: sigue [frontend/README.md](frontend/README.md).
- Backend: sigue [backend/README.md](backend/README.md) y revisa el contrato vigente en `backend/CONTRATO_FRONTEND_v1.4.md`.

El cliente frontend lee `VITE_API_BASE_URL` o el alias `VITE_API_URL`; sin ambas usa `http://localhost:8000/api/`.

## Estructura

- `frontend/`: landing, autenticación, portal estudiantil, portal de validación de empresas y cliente API.
- `backend/`: API, autenticación, reglas de matching, datos demo y configuración de despliegue.
- `output/pdf/`: documentos de apoyo del proyecto y del evento.
