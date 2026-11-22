-- NEXO U - SCRIPT ÚNICO PARA NEON CONSOLE (PostgreSQL)
-- Ejecutar preferiblemente en una RAMA DE PRUEBA de Neon. IF NOT EXISTS no repara esquemas incompatibles.
-- Contiene tablas del backend anterior + extensiones; NO crea contraseñas ni usuarios demo.
-- Modifica tres políticas RLS de tablas financieras (DROP POLICY no borra filas ni tablas).
-- No concede roles PostgreSQL de superusuario. Los 3 roles son roles de la API JWT.
-- Ejecutar en la base de datos correcta (por ejemplo neondb) con una cuenta de propietario.
-- IMPORTANTE: no usar conexión directa desde el frontend. Solo FastAPI conoce DATABASE_URL.

BEGIN;

CREATE TABLE IF NOT EXISTS app_users (
	id BIGSERIAL NOT NULL, 
	email TEXT NOT NULL, 
	password_hash TEXT NOT NULL, 
	role TEXT NOT NULL, 
	active BOOLEAN NOT NULL, 
	token_version INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_app_roles CHECK (role IN ('usuario','empresa','admin')), 
	UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS courses (
	id SERIAL NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	end_date DATE NOT NULL, 
	cost_bob FLOAT NOT NULL, 
	credential_kind VARCHAR(30) NOT NULL, 
	credential_value VARCHAR(120) NOT NULL, 
	credential_level VARCHAR(20), 
	issuer VARCHAR(120) NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS opportunities (
	id SERIAL NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	category VARCHAR(50) NOT NULL, 
	deadline DATE NOT NULL, 
	official_url VARCHAR(500) NOT NULL, 
	amount_bob FLOAT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS profiles (
	id SERIAL NOT NULL, 
	name VARCHAR(120) NOT NULL, 
	career VARCHAR(120) NOT NULL, 
	semester INTEGER NOT NULL, 
	age INTEGER NOT NULL, 
	city VARCHAR(120) NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
	id BIGSERIAL NOT NULL, 
	actor_user_id BIGINT, 
	action TEXT NOT NULL, 
	target_type TEXT, 
	target_id TEXT, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(actor_user_id) REFERENCES app_users (id)
);

CREATE TABLE IF NOT EXISTS community_posts (
	id BIGSERIAL NOT NULL, 
	author_user_id BIGINT NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	body TEXT NOT NULL, 
	visible BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(author_user_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credentials (
	id SERIAL NOT NULL, 
	student_id INTEGER NOT NULL, 
	kind VARCHAR(30) NOT NULL, 
	value VARCHAR(120) NOT NULL, 
	level VARCHAR(20), 
	verified BOOLEAN NOT NULL, 
	issuer VARCHAR(120), 
	PRIMARY KEY (id), 
	FOREIGN KEY(student_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS enrollments (
	id SERIAL NOT NULL, 
	student_id INTEGER NOT NULL, 
	course_id INTEGER NOT NULL, 
	completed BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (student_id, course_id), 
	FOREIGN KEY(student_id) REFERENCES profiles (id), 
	FOREIGN KEY(course_id) REFERENCES courses (id)
);

CREATE TABLE IF NOT EXISTS finance_budgets (
	id BIGSERIAL NOT NULL, 
	user_id BIGINT NOT NULL, 
	category VARCHAR(80) NOT NULL, 
	month VARCHAR(7) NOT NULL, 
	limit_bob NUMERIC(12, 2) NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_budget_month UNIQUE (user_id, category, month), 
	CONSTRAINT ck_budget_limit CHECK (limit_bob >= 0), 
	FOREIGN KEY(user_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance_entries (
	id BIGSERIAL NOT NULL, 
	user_id BIGINT NOT NULL, 
	direction VARCHAR(10) NOT NULL, 
	amount_bob NUMERIC(12, 2) NOT NULL, 
	category VARCHAR(80) NOT NULL, 
	happened_on DATE NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_entry_direction CHECK (direction IN ('income','expense')), 
	CONSTRAINT ck_entry_amount CHECK (amount_bob > 0), 
	FOREIGN KEY(user_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance_obligations (
	id BIGSERIAL NOT NULL, 
	user_id BIGINT NOT NULL, 
	title VARCHAR(120) NOT NULL, 
	amount_bob NUMERIC(12, 2) NOT NULL, 
	due_on DATE NOT NULL, 
	paid BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_obligation_amount CHECK (amount_bob >= 0), 
	FOREIGN KEY(user_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
	id BIGSERIAL NOT NULL, 
	user_id BIGINT NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	message TEXT NOT NULL, 
	read BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organizations (
	id BIGSERIAL NOT NULL, 
	owner_user_id BIGINT NOT NULL, 
	name TEXT NOT NULL, 
	verified BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(owner_user_id) REFERENCES app_users (id)
);

CREATE TABLE IF NOT EXISTS requirements (
	id SERIAL NOT NULL, 
	opportunity_id INTEGER NOT NULL, 
	kind VARCHAR(30) NOT NULL, 
	operator VARCHAR(20) NOT NULL, 
	value VARCHAR(120) NOT NULL, 
	mandatory BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(opportunity_id) REFERENCES opportunities (id)
);

CREATE TABLE IF NOT EXISTS saved_opportunities (
	user_id BIGINT NOT NULL, 
	opportunity_id INTEGER NOT NULL, 
	remind_on DATE, 
	PRIMARY KEY (user_id, opportunity_id), 
	FOREIGN KEY(user_id) REFERENCES app_users (id) ON DELETE CASCADE, 
	FOREIGN KEY(opportunity_id) REFERENCES opportunities (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scholarship_bands (
	id BIGSERIAL NOT NULL, 
	opportunity_id INTEGER NOT NULL, 
	percent_discount INTEGER NOT NULL, 
	min_average NUMERIC(5, 2) NOT NULL, 
	min_math NUMERIC(5, 2) NOT NULL, 
	official_published BOOLEAN NOT NULL, 
	approved_by_admin BOOLEAN NOT NULL, 
	official_url VARCHAR(500) NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_band_opportunity_percent UNIQUE (opportunity_id, percent_discount), 
	CONSTRAINT ck_percent_band CHECK (percent_discount BETWEEN 1 AND 100), 
	CONSTRAINT ck_min_avg_band CHECK (min_average BETWEEN 0 AND 100), 
	CONSTRAINT ck_min_math_band CHECK (min_math BETWEEN 0 AND 100), 
	FOREIGN KEY(opportunity_id) REFERENCES opportunities (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS school_profiles (
	user_id BIGINT NOT NULL, 
	full_name VARCHAR(120) NOT NULL, 
	city VARCHAR(120) NOT NULL, 
	graduation_year INTEGER NOT NULL, 
	average_grade NUMERIC(5, 2) NOT NULL, 
	math_grade NUMERIC(5, 2) NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (user_id), 
	CONSTRAINT ck_school_average CHECK (average_grade >= 0 AND average_grade <= 100), 
	CONSTRAINT ck_school_math CHECK (math_grade >= 0 AND math_grade <= 100), 
	FOREIGN KEY(user_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_accounts (
	user_id BIGINT NOT NULL, 
	profile_id INTEGER, 
	PRIMARY KEY (user_id), 
	FOREIGN KEY(user_id) REFERENCES app_users (id) ON DELETE CASCADE, 
	UNIQUE (profile_id), 
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transactions (
	id SERIAL NOT NULL, 
	student_id INTEGER NOT NULL, 
	amount_bob FLOAT NOT NULL, 
	category VARCHAR(60) NOT NULL, 
	date DATE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(student_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS community_comments (
	id BIGSERIAL NOT NULL, 
	post_id BIGINT NOT NULL, 
	author_user_id BIGINT NOT NULL, 
	body TEXT NOT NULL, 
	visible BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(post_id) REFERENCES community_posts (id) ON DELETE CASCADE, 
	FOREIGN KEY(author_user_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_events (
	id BIGSERIAL NOT NULL, 
	organization_id BIGINT NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	description TEXT NOT NULL, 
	starts_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	public_url VARCHAR(500), 
	published BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS institutional_campaigns (
	id BIGSERIAL NOT NULL, 
	organization_id BIGINT NOT NULL, 
	title TEXT NOT NULL, 
	sponsorship_disclosed BOOLEAN NOT NULL, 
	starts_on DATE, 
	ends_on DATE, 
	status TEXT NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_campaign_status CHECK (status IN ('draft','active','paused','finished')), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
);

CREATE TABLE IF NOT EXISTS organization_courses (
	organization_id BIGINT NOT NULL, 
	course_id INTEGER NOT NULL, 
	PRIMARY KEY (organization_id, course_id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
	UNIQUE (course_id), 
	FOREIGN KEY(course_id) REFERENCES courses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organization_members (
	user_id BIGINT NOT NULL, 
	organization_id BIGINT NOT NULL, 
	PRIMARY KEY (user_id, organization_id), 
	FOREIGN KEY(user_id) REFERENCES app_users (id) ON DELETE CASCADE, 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organization_opportunities (
	organization_id BIGINT NOT NULL, 
	opportunity_id INTEGER NOT NULL, 
	PRIMARY KEY (organization_id, opportunity_id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
	UNIQUE (opportunity_id), 
	FOREIGN KEY(opportunity_id) REFERENCES opportunities (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS referral_agreements (
	id BIGSERIAL NOT NULL, 
	organization_id BIGINT NOT NULL, 
	course_id INTEGER, 
	commission_bob NUMERIC(12, 2), 
	disclosed BOOLEAN NOT NULL, 
	active BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_commission_positive CHECK (commission_bob IS NULL OR commission_bob >= 0), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id), 
	FOREIGN KEY(course_id) REFERENCES courses (id)
);

CREATE TABLE IF NOT EXISTS referral_events (
	id BIGSERIAL NOT NULL, 
	agreement_id BIGINT NOT NULL, 
	student_user_id BIGINT NOT NULL, 
	completed BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_referral_student UNIQUE (agreement_id, student_user_id), 
	FOREIGN KEY(agreement_id) REFERENCES referral_agreements (id), 
	FOREIGN KEY(student_user_id) REFERENCES app_users (id)
);

CREATE INDEX IF NOT EXISTS ix_finance_budgets_user_id ON finance_budgets (user_id);

CREATE INDEX IF NOT EXISTS ix_finance_entries_user_id ON finance_entries (user_id);

CREATE INDEX IF NOT EXISTS ix_finance_obligations_user_id ON finance_obligations (user_id);

CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id);

-- Ampliación no destructiva sobre bases instaladas con scripts anteriores.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS organization_id BIGINT REFERENCES organizations(id);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS sponsored BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS organization_id BIGINT REFERENCES organizations(id);
ALTER TABLE scholarship_bands ADD COLUMN IF NOT EXISTS approved_by_admin BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON app_users (lower(email));
CREATE INDEX IF NOT EXISTS idx_opp_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_course_end_date ON courses(end_date);
CREATE INDEX IF NOT EXISTS idx_school_bands_opp ON scholarship_bands(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
COMMIT;

-- INTEGRACIÓN EDUCATIVA v1.2: seguro para instalar desde cero o actualizar.
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


-- POLÍTICAS RLS DE FINANZAS: aplicar DESPUÉS de que existan las tablas.
-- Las consultas deben correr por FastAPI después de set_config('nexou.user_id', ... , true).
-- La opción FORCE aplica incluso al propietario normal de la tabla.
BEGIN;

ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS finance_entries_personal ON finance_entries;
CREATE POLICY finance_entries_personal ON finance_entries
  FOR ALL USING (user_id = NULLIF(current_setting('nexou.user_id', true), '')::bigint)
  WITH CHECK (user_id = NULLIF(current_setting('nexou.user_id', true), '')::bigint);

ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budgets FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS finance_budgets_personal ON finance_budgets;
CREATE POLICY finance_budgets_personal ON finance_budgets
  FOR ALL USING (user_id = NULLIF(current_setting('nexou.user_id', true), '')::bigint)
  WITH CHECK (user_id = NULLIF(current_setting('nexou.user_id', true), '')::bigint);

ALTER TABLE finance_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_obligations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS finance_obligations_personal ON finance_obligations;
CREATE POLICY finance_obligations_personal ON finance_obligations
  FOR ALL USING (user_id = NULLIF(current_setting('nexou.user_id', true), '')::bigint)
  WITH CHECK (user_id = NULLIF(current_setting('nexou.user_id', true), '')::bigint);

COMMIT;
