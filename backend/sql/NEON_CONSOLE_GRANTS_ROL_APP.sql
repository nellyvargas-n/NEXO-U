-- OPCIONAL. Antes crea desde Neon Console un rol normal llamado nexou_app, con LOGIN
-- y contraseña fuerte. Verifica que ese rol NO tenga atributo BYPASSRLS.
-- Este script NO crea contraseñas. SOLO otorga DML si el rol ya existe.
-- Conecta luego FastAPI como nexou_app; NO como neondb_owner.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='nexou_app') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO nexou_app';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nexou_app';
    EXECUTE 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nexou_app';
    RAISE NOTICE 'Permisos asignados al rol nexou_app';
  ELSE
    RAISE EXCEPTION 'Debes crear primero el rol nexou_app desde Neon Console';
  END IF;
END $$;
