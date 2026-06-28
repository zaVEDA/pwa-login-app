-- Расширяем таблицу users данными профиля и авторизации
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_pep BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS users_login_key ON users (login) WHERE login IS NOT NULL;

-- Доверенные устройства
CREATE TABLE IF NOT EXISTS user_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    user_agent TEXT,
    trusted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_seen_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS user_devices_user_device_key ON user_devices (user_id, device_id);

-- Одноразовые коды (SMS/email): вход, восстановление, подтверждение почты
CREATE TABLE IF NOT EXISTS auth_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    phone VARCHAR(30),
    email VARCHAR(255),
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    channel VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_codes_phone_idx ON auth_codes (phone);
CREATE INDEX IF NOT EXISTS auth_codes_email_idx ON auth_codes (email);

-- Сессионные токены
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    device_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS user_sessions_token_idx ON user_sessions (token);