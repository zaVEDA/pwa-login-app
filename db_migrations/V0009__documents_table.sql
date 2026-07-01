-- Документы реализации: акты выполненных работ и товарные накладные.
-- Единый вид документа с общей сквозной нумерацией (как счета).
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    doc_type VARCHAR(20) NOT NULL,          -- 'act' | 'invoice_note'
    doc_number VARCHAR(50) NOT NULL,        -- общая нумерация для актов и накладных
    doc_date DATE DEFAULT CURRENT_DATE,
    invoice_id INTEGER,                     -- счёт-основание (если создан на основании)
    invoice_number VARCHAR(50),
    client_type VARCHAR(20),
    client_name VARCHAR(255),
    client_inn VARCHAR(20),
    client_ogrnip VARCHAR(20),
    client_address TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total NUMERIC,
    status VARCHAR(20) DEFAULT 'created',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS documents_user_idx ON documents (user_id);
CREATE INDEX IF NOT EXISTS documents_number_idx ON documents (user_id, doc_number);