CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    name VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(200),
    message TEXT NOT NULL,
    answer TEXT,
    answered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets (created_at DESC);
