-- Отмечаем служебные (тестовые) аккаунты, чтобы не попадали в аналитику Заведующей
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users SET is_test = TRUE
WHERE phone IN ('+79001234567', '+79990001122', '+70000000002', '+70000000000', '+79997776655');
