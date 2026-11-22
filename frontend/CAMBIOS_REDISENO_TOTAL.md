# NEXO U — Rediseño total (solo frontend)

Diseño unificado para inicio, explorador, dashboard, perfil, becas, pasantías, cursos, rutas, credenciales, billetera, empresa, administrador, validaciones, registro y login.

Los datos reales se consultan de FastAPI (`/api/v1/*`) mediante `src/shared/api/client.ts`. Ninguna cuenta, beca, estudiante o curso se ha inventado en el modo normal. Los filtros consultan el catálogo público real y las vistas privadas requieren JWT. Para revisar una maqueta separada, únicamente el explorador admite `?demo=1` y etiqueta los ejemplos como ficticios.

**No se modificaron archivos de backend ni se ejecutó SQL en Neon.** Este archivo no incluye contraseñas.

## Instalación
1. Copia solamente `frontend/` de este ZIP a tu proyecto, respaldando antes tu carpeta actual.
2. Configura `frontend/.env.local` con `VITE_API_BASE_URL=/api/` (no metas contraseñas).
3. Desde `frontend/`: `npm install`, `npm run build`, `npm run dev`.
4. Abre `http://localhost:5173/`, `/explorar`, `/app`, `/empresa` y `/admin` después de iniciar sesión según rol.
5. Asegura que Docker/FastAPI esté en `http://localhost:8000`; `vite.config.js` mantiene el proxy `/api`.

## Datos visibles
- Portada: `GET /api/v1/oportunidades/publicas`
- Explorador: convocatorias públicas + matching `/api/v1/usuario/match` si hay sesión
- Resumen estudiante: perfiles, credenciales, cursos y oportunidades consultados directamente
- Empresa: sus organizaciones, oportunidades, cursos e inscripciones con tokens JWT
- Admin: datos agregados reales de sus endpoints administrativos
- Páginas internas restantes: conservan sus servicios y formularios API existentes, estilizados con el sistema visual unificado

Si Neon devuelve lista vacía, se muestra un estado vacío honesto. No se carga información ficticia para aparentar actividad.
