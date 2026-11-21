-- Extensión de modelo sostenible. No concede acceso público a datos privados.
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS organization_id BIGINT REFERENCES organizations(id);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS sponsored BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS organization_id BIGINT REFERENCES organizations(id);
CREATE TABLE IF NOT EXISTS institutional_campaigns (
 id BIGSERIAL PRIMARY KEY, organization_id BIGINT NOT NULL REFERENCES organizations(id),
 title TEXT NOT NULL, sponsorship_disclosed BOOLEAN NOT NULL DEFAULT TRUE,
 starts_on DATE, ends_on DATE, status TEXT NOT NULL DEFAULT 'draft'
 CHECK(status IN ('draft','active','paused','finished'))
);
CREATE TABLE IF NOT EXISTS referral_agreements (
 id BIGSERIAL PRIMARY KEY, organization_id BIGINT NOT NULL REFERENCES organizations(id),
 course_id INTEGER REFERENCES courses(id), commission_bob NUMERIC(12,2),
 disclosed BOOLEAN NOT NULL DEFAULT TRUE, active BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS referral_events (
 id BIGSERIAL PRIMARY KEY, agreement_id BIGINT NOT NULL REFERENCES referral_agreements(id),
 student_user_id BIGINT NOT NULL REFERENCES app_users(id),
 completed BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(agreement_id,student_user_id)
);
-- Reglas de negocio: usuario ve SOLO sus datos; empresa administra SOLO sus organizaciones;
-- admin supervisa; NO implementar acceso basado únicamente en cabeceras elegidas por cliente.
-- IMPORTANTE: estas tablas NO habilitan RLS ni autentican por sí mismas.
-- La API debe verificar JWT y propiedad antes de exponer datos reales.
