-- Consultas de SOLO LECTURA para confirmar el esquema creado en Neon SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE'
ORDER BY table_name;

-- Los tres roles viven en app_users.role, no son roles superusuario PostgreSQL
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name='app_users' AND column_name IN ('id','email','role','password_hash') ORDER BY ordinal_position;

-- Estado RLS: relrowsecurity y relforcerowsecurity deben ser TRUE en finanzas
SELECT relname AS tabla, relrowsecurity AS rls_habilitado,
       relforcerowsecurity AS fuerza_rls
FROM pg_class
WHERE relname IN ('finance_entries','finance_budgets','finance_obligations');

-- El usuario de conexión con BYPASSRLS puede omitir políticas (evitarlo para tráfico API real)
SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname=current_user;
