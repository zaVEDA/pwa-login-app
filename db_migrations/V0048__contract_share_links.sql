CREATE TABLE IF NOT EXISTS contract_links (
    token VARCHAR(48) PRIMARY KEY,
    contract_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    file_key TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    opened_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS contract_links_contract_idx ON contract_links (contract_id);
