-- Ejecutar después de 01, 02 y 03. Requiere tablas existentes.
CREATE TABLE IF NOT EXISTS organization_opportunities (
 organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
 opportunity_id INTEGER NOT NULL UNIQUE REFERENCES opportunities(id) ON DELETE CASCADE,
 PRIMARY KEY (organization_id,opportunity_id)
);
CREATE TABLE IF NOT EXISTS organization_courses (
 organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
 course_id INTEGER NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
 PRIMARY KEY (organization_id,course_id)
);
CREATE INDEX IF NOT EXISTS idx_student_accounts_profile ON student_accounts(profile_id);
-- La API usa un usuario de conexión servidor. NO conceder acceso directo
-- a estas tablas desde el navegador. RLS y un rol DB con privilegios mínimos
-- deben configurarse antes de abrir acceso directo al cliente.
