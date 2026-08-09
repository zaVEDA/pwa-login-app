ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);