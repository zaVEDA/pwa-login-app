ALTER TABLE contracts ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
UPDATE contracts SET status = 'draft' WHERE status IS NULL OR status = '';
