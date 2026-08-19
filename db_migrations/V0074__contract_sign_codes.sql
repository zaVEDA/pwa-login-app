CREATE TABLE IF NOT EXISTS contract_sign_codes (
    id SERIAL PRIMARY KEY,
    token VARCHAR(48) NOT NULL,
    contract_id INTEGER NOT NULL,
    phone VARCHAR(30) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS contract_sign_codes_token_idx ON contract_sign_codes (token);
