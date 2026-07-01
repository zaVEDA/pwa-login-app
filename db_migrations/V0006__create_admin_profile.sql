-- Создаём профиль администратора с логином admin (пароль задаётся при первом входе)
INSERT INTO users (phone, login, role, full_name, profile_completed, consent_pep, consent_at, created_at)
VALUES ('+70000000001', 'admin', 'admin', 'Администратор', TRUE, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

UPDATE users SET role = 'admin' WHERE login = 'admin';