-- Тестовый аккаунт: логин test, пароль задаётся при первом входе
INSERT INTO users (phone, login, role, full_name, email, profile_completed, consent_pep, consent_at, created_at)
VALUES ('+70000000002', 'test', 'user', 'Тестовый Пользователь', 'test@example.com', TRUE, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

UPDATE users SET role = 'user', profile_completed = TRUE, full_name = 'Тестовый Пользователь' WHERE login = 'test';