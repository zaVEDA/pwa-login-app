CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    template_key VARCHAR(120) NOT NULL,
    title VARCHAR(255) NOT NULL,
    contract_number VARCHAR(50),
    contract_date DATE DEFAULT CURRENT_DATE,
    client_name VARCHAR(255),
    values JSONB DEFAULT '{}'::jsonb,
    body TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    signed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS contracts_user_idx ON contracts (user_id);
CREATE INDEX IF NOT EXISTS contracts_status_idx ON contracts (user_id, status);
