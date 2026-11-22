# NEXO U — Cambios exclusivamente frontend

## Archivos modificados
- `src/App.jsx`: nuevo layout de exploración.
- `src/routes/index.jsx`: `/` y `/explorar` ahora usan el portal; la portada antigua está en `/inicio`.
- `src/features/student-app/StudentApp.jsx`: `/app/oportunidades` utiliza la nueva vista ancha.
- `src/features/opportunities/OpportunitiesPage.jsx`: tarjetas, filtros, búsqueda, detalle y sugerencias.
- `src/features/opportunities/opportunity-board.css`: diseño responsive de tres columnas.

Se mantienen el cliente API y los formularios de autenticación existentes.

## Estado real
- Listas reales si FastAPI/Neon devuelve convocatorias.
- Estado vacío si no hay ninguna.
- Demo visual si se pulsa el botón o se accede con `?demo=1`.
- Guardados locales (en el navegador), no sincronizados con Neon.
- Los paneles de empresa y administrador no se alteraron.
