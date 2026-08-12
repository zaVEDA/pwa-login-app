UPDATE users SET phone = '+79016625752' WHERE login = 'zaVed' AND role = 'admin';

CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    maintenance_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT app_settings_single_row CHECK (id = 1)
);

INSERT INTO app_settings (id, maintenance_enabled) VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;
