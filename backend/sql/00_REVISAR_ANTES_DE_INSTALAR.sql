-- NEXO U | PRIMER PASO: consultar sin modificar ni borrar nada.
SELECT current_database() AS database_name, current_schema() AS schema_name;
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;
SELECT column_name, data_type FROM information_schema.columns
 WHERE table_schema='public' AND table_name='app_users' ORDER BY ordinal_position;
-- En Neon crea primero un BRANCH de pruebas o un respaldo.
-- Si app_users ya existe con columnas incompatibles, NO ejecutar el instalador sin migración.
