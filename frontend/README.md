

1. Haz una copia de seguridad de tu carpeta `frontend` actual y conserva tu configuración privada `frontend/.env.local` si existe.
2. Extrae este ZIP y sustituye **solo la carpeta `frontend`** en tu proyecto. No cambies `backend` ni ejecutes SQL.
3. Abre `frontend/.env.local` (créalo si falta) y coloca: `VITE_API_BASE_URL=/api/`.
4. En otra terminal, dentro de `backend`, inicia Docker: `docker compose up -d --build`; confirma que `http://localhost:8000/ready` está listo.
5. En la carpeta `frontend`, ejecuta: `npm install`, `npm run build` y `npm run dev`.
6. Abre `http://localhost:5173` y comprueba que `http://localhost:5173/version-nexou-v10.txt` dice **V10**.

Los datos del frontend provienen de `http://localhost:8000` mediante el proxy de Vite. No pongas `DATABASE_URL`, `JWT_SECRET` ni contraseñas de Neon en el frontend ni en GitHub.

## Rutas y roles

- `/` — Portada pública (datos de convocatorias desde la API).
- `/login` y `/register` — Acceso de estudiantes y empresas; la creación de administrador **nunca es pública**.
- `/explorar` — Catálogo real, búsqueda, filtros, requisitos y guardados por cuenta.
- `/app` — Panel personal del estudiante, estadísticas de su cuenta y convocatorias reales.
- `/app/perfil`, `/app/credenciales`, `/app/cursos`, `/app/rutas` — Perfil, credenciales y formación.
- `/app/oportunidades/becas`, `/app/oportunidades/pasantias` — Becas y pasantías.
- `/app/guardados`, `/app/notificaciones`, `/app/billetera`, `/app/configuracion` — Datos personales y seguridad.
- `/empresa` — Gestión de organizaciones, oportunidades, cursos, requisitos e inscripciones.
- `/empresa/cursos/validar` — Validación de cursos (solo empresa propietaria).
- `/admin` — Usuarios y organizaciones (solo rol `admin`).

## Qué hay que considerar

- Las **postulaciones externas** ocurren en la web oficial de la convocatoria; NEXO U no afirma recibirlas ni las cuenta si no existe endpoint.
- Los indicadores de compatibilidad solo aparecen si el motor devuelve una evaluación, y no garantizan la adjudicación de una beca o pasantía.
- El registro de empresas no las verifica automáticamente: un administrador debe aprobarlas.
- Una lista vacía `[]` de FastAPI es un estado válido y no debe reemplazarse por datos ficticios.
- Las finanzas siguen limitadas a universitarios adultos según el backend.
- El correo SMTP y Gemini son opcionales para esta interfaz; no se requieren para navegar por el catálogo.

## Producción / Vercel

Para producción, el frontend debe usar `VITE_API_BASE_URL=https://TU_BACKEND_PUBLICO/api/` y FastAPI debe admitir la dirección HTTPS del frontend en `CORS_ORIGINS`. El proxy Vite solo opera en desarrollo local. Verifica el login, permisos y los endpoints antes de publicar.
