-- Ejecutar primero en Neon SQL Editor. Compatible con el backend original.
CREATE TABLE IF NOT EXISTS profiles (id SERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, career VARCHAR(120) NOT NULL, semester INTEGER NOT NULL, age INTEGER NOT NULL, city VARCHAR(120) NOT NULL DEFAULT 'La Paz');
CREATE TABLE IF NOT EXISTS credentials (id SERIAL PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES profiles(id), kind VARCHAR(30) NOT NULL, value VARCHAR(120) NOT NULL, level VARCHAR(20), verified BOOLEAN NOT NULL DEFAULT FALSE, issuer VARCHAR(120));
CREATE TABLE IF NOT EXISTS opportunities (id SERIAL PRIMARY KEY, title VARCHAR(200) NOT NULL, category VARCHAR(50) NOT NULL, deadline DATE NOT NULL, official_url VARCHAR(500) NOT NULL, amount_bob DOUBLE PRECISION NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS requirements (id SERIAL PRIMARY KEY, opportunity_id INTEGER NOT NULL REFERENCES opportunities(id), kind VARCHAR(30) NOT NULL, operator VARCHAR(20) NOT NULL, value VARCHAR(120) NOT NULL, mandatory BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS courses (id SERIAL PRIMARY KEY, title VARCHAR(200) NOT NULL, end_date DATE NOT NULL, cost_bob DOUBLE PRECISION NOT NULL DEFAULT 0, credential_kind VARCHAR(30) NOT NULL, credential_value VARCHAR(120) NOT NULL, credential_level VARCHAR(20), issuer VARCHAR(120) NOT NULL);
CREATE TABLE IF NOT EXISTS enrollments (id SERIAL PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES profiles(id), course_id INTEGER NOT NULL REFERENCES courses(id), completed BOOLEAN NOT NULL DEFAULT FALSE, UNIQUE(student_id,course_id));
CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES profiles(id), amount_bob DOUBLE PRECISION NOT NULL, category VARCHAR(60) NOT NULL, date DATE NOT NULL);
CREATE INDEX IF NOT EXISTS idx_credentials_student ON credentials(student_id);
CREATE INDEX IF NOT EXISTS idx_requirements_opportunity ON requirements(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON transactions(student_id);
