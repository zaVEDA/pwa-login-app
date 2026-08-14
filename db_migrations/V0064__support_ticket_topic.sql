-- Тема обращения в поддержку (например «Шаблон» для заявок по акции)
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS topic VARCHAR(60) NULL;
CREATE INDEX IF NOT EXISTS idx_support_tickets_topic ON support_tickets (topic);
