# INICIO AQUÍ — NEXO U v1.4

1. Guarda tu viejo `.env` **solo en tu computadora**, con una contraseña Neon renovada y JWT secreto nuevo. No lo compartas.
2. Haz una copia de seguridad de Neon y elige la rama de prueba `prueba-v12`.
3. En Neon SQL Editor pega y ejecuta **solo** `backend/sql/07_seguridad_v14.sql` y luego consulta `08_comprobar_v14.sql`. No borres tus tablas ni pegues otra vez el SQL grande.
4. Copia `backend/.env.example` a `backend/.env`. Introduce tus valores privados **ahí**, nunca en Git.
5. Abre VS Code en `NEXO-U`; en terminal de `backend`, corre `docker compose up -d --build`.
6. Abre `/ready` (debe mostrar `schema: v1.4`) y `/docs`. Prueba `python -m scripts.smoke_api`.
7. En terminal de `frontend`, ejecuta `npm install`, copia `.env.example` a `.env.local`, ejecuta `npm run dev` y abre `http://localhost:5173`.
8. Crea o usa cuentas de prueba; el panel de administrador no se obtiene con registro público. Para demo de hackathon, el seed explícito de pruebas genera credenciales nuevas y oportunidades **ficticias**.
9. Para Vercel se crean dos proyectos desde Git: raíz `backend` y raíz `frontend`; configura variables de entorno privadas en el backend y `VITE_API_URL` pública para React.

El sistema NO fue desplegado en tu Vercel ni ejecutado contra tu Neon desde este archivo. Es necesario probar esas dos integraciones en tu equipo.
