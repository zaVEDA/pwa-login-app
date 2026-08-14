-- Скрываем тестовые документы у Заведующей (id 19) и Гостя (id 25):
-- ставим им статус, который приложение не показывает в списках.
UPDATE contracts SET status = 'archived_test' WHERE user_id IN (19, 25);
UPDATE invoices SET status = 'archived_test' WHERE user_id IN (19, 25);
UPDATE documents SET status = 'archived_test' WHERE user_id IN (19, 25);
