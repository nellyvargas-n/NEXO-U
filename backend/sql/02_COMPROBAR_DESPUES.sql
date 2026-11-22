-- Lectura de estado, no cambia datos.
SELECT table_name FROM information_schema.tables WHERE table_schema='public'
 AND table_name IN ('app_users','organizations','student_accounts','profiles','opportunities',
 'requirements','courses','enrollments','finance_entries','school_profiles','scholarship_bands')
 ORDER BY table_name;
SELECT column_name FROM information_schema.columns WHERE table_schema='public'
 AND table_name='app_users' AND column_name='token_version';
