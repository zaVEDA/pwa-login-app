CREATE TABLE IF NOT EXISTS access_passwords (
    id SERIAL PRIMARY KEY,
    target VARCHAR(32) NOT NULL,
    login VARCHAR(255),
    user_id INTEGER,
    password_hash TEXT NOT NULL,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_passwords_target ON access_passwords (target);