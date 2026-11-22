# INICIO AQUÍ — NEXO U v1.4

1. Guarda tu viejo `.env` **solo en tu computadora**, con una contraseña Neon renovada y JWT secreto nuevo. No lo compartas.
2. Haz una copia de seguridad de Neon y confirma que Docker y el backend desplegado apuntan a la rama de prueba `prueba-v12`.
3. Las revisiones versionadas de Alembic se ejecutan al iniciar Docker y durante el build del proyecto Vercel `backend/`. No pegues a mano los scripts SQL para las mismas revisiones.
4. Copia `backend/.env.example` a `backend/.env`. Introduce tus valores privados **ahí**, nunca en Git.
5. Abre VS Code en `NEXO-U`; en terminal de `backend`, corre `docker compose up -d --build`. El contenedor actualiza la base antes de arrancar la API.
6. Abre `/ready` (debe mostrar `schema: v1.4`) y `/docs`. Prueba `python -m scripts.smoke_api`.
7. En terminal de `frontend`, ejecuta `npm install`, copia `.env.example` a `.env.local`, ejecuta `npm run dev` y abre `http://localhost:5173`.
8. Crea o usa cuentas de prueba; el panel de administrador no se obtiene con registro público. Para demo de hackathon, el seed explícito de pruebas genera credenciales nuevas y oportunidades **ficticias**.
9. Para Vercel se crean dos proyectos desde Git: raíz `backend` y raíz `frontend`; configura `DATABASE_URL`/`DATABASE_URL_UNPOOLED` privadas en backend y `VITE_API_URL` con la URL pública del backend para React. Cada deploy del backend aplica Alembic al entorno configurado.

La configuración de variables y el dominio final de cada proyecto siguen siendo propios de tu cuenta Vercel. Verifica el deployment de backend en `/api/v1/meta` y los catálogos públicos después de cada actualización.
