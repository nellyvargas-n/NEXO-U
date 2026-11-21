-- Tres roles de APLICACION (no superusuarios de PostgreSQL).
-- Este script define identidad y pertenencia; los endpoints antiguos de demo NO aplican aún estos permisos.
CREATE TABLE IF NOT EXISTS app_users (
 id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('usuario','empresa','admin')),
 active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS organizations (
 id BIGSERIAL PRIMARY KEY, owner_user_id BIGINT NOT NULL REFERENCES app_users(id),
 name TEXT NOT NULL, verified BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS student_accounts (
 user_id BIGINT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
 profile_id INTEGER UNIQUE REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS organization_members (
 user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
 PRIMARY KEY(user_id,organization_id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id BIGSERIAL PRIMARY KEY, actor_user_id BIGINT REFERENCES app_users(id),
 action TEXT NOT NULL, target_type TEXT, target_id TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- No se insertan cuentas ni contraseñas por defecto.
-- Usar Argon2/bcrypt para password_hash; no almacenar contraseñas en texto claro.
