-- NEXO U v1.2 - MIGRACIÓN ADITIVA PARA NEON EXISTENTE
-- IMPORTANTE: hacer una rama/backup de Neon; probar allí antes de aplicar a main.
-- No elimina datos, tablas, perfiles, cuentas, ni contraseñas.
-- Ejecutar UNA VEZ después del esquema original (NEON_CONSOLE_TODO.sql).
-- Se puede ejecutar más veces: las instrucciones son idempotentes.
BEGIN;

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS student_user_id BIGINT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS student_user_id BIGINT;
-- Un colegial no tiene profiles.id, pero sí app_users.id y school_profiles.user_id.
ALTER TABLE credentials ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE enrollments ALTER COLUMN student_id DROP NOT NULL;

-- Recuperar asociación con la cuenta para datos universitarios antiguos.
UPDATE credentials AS c SET student_user_id = sa.user_id
FROM student_accounts AS sa
WHERE c.student_id = sa.profile_id AND c.student_user_id IS NULL;
UPDATE enrollments AS e SET student_user_id = sa.user_id
FROM student_accounts AS sa
WHERE e.student_id = sa.profile_id AND e.student_user_id IS NULL;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_credentials_app_user'
                   AND conrelid = 'credentials'::regclass) THEN
        ALTER TABLE credentials ADD CONSTRAINT fk_credentials_app_user
            FOREIGN KEY (student_user_id) REFERENCES app_users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_enrollments_app_user'
                   AND conrelid = 'enrollments'::regclass) THEN
        ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_app_user
            FOREIGN KEY (student_user_id) REFERENCES app_users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS ix_credentials_student_user_id ON credentials(student_user_id);
CREATE INDEX IF NOT EXISTS ix_enrollments_student_user_id ON enrollments(student_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_enrollments_user_course
    ON enrollments(student_user_id, course_id);
COMMIT;

-- COMPROBACIÓN: deben aparecer student_user_id (credentials/enrollments) e is_demo (opportunities).
SELECT table_name,column_name,is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND (
  (table_name IN ('credentials','enrollments') AND column_name IN ('student_id','student_user_id'))
  OR (table_name='opportunities' AND column_name='is_demo'))
ORDER BY table_name,column_name;
