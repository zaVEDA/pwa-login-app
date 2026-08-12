CREATE TABLE IF NOT EXISTS sms_log (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    user_id INTEGER,
    kind VARCHAR(30) NOT NULL,
    is_repeat BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_log_created_at ON sms_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_log_phone ON sms_log (phone);
CREATE INDEX IF NOT EXISTS idx_sms_log_kind ON sms_log (kind);
