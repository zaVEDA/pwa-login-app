-- Отдельная фиксация каждого из трёх согласий при регистрации.
-- Доказательная база: какой именно документ, когда и с какого устройства принят.

-- Промежуточное хранение отметок между отправкой SMS и подтверждением кода
ALTER TABLE auth_codes ADD COLUMN IF NOT EXISTS consent_personal BOOLEAN DEFAULT FALSE;
ALTER TABLE auth_codes ADD COLUMN IF NOT EXISTS consent_offer BOOLEAN DEFAULT FALSE;
ALTER TABLE auth_codes ADD COLUMN IF NOT EXISTS consent_pep BOOLEAN DEFAULT FALSE;

-- Итоговые отметки в карточке пользователя
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_personal BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_personal_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_offer BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_offer_at TIMESTAMP;

-- Журнал принятых документов: по одной строке на каждый документ
CREATE TABLE IF NOT EXISTS user_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    doc_type VARCHAR(30) NOT NULL,      -- 'personal_data' | 'offer' | 'pep'
    doc_version VARCHAR(20) DEFAULT 'v1',
    accepted BOOLEAN NOT NULL DEFAULT TRUE,
    accepted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    phone VARCHAR(30),
    auth_code_id INTEGER,
    code VARCHAR(10),
    ip_address VARCHAR(64),
    user_agent TEXT,
    consent_text_hash VARCHAR(128),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_consents_user_idx ON user_consents (user_id);
CREATE INDEX IF NOT EXISTS user_consents_doc_type_idx ON user_consents (doc_type);
CREATE INDEX IF NOT EXISTS user_consents_accepted_at_idx ON user_consents (accepted_at);
