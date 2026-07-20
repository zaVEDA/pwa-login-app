CREATE TABLE IF NOT EXISTS admin_tasks (
    id SERIAL PRIMARY KEY,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    assignee VARCHAR(10) NOT NULL DEFAULT 'Я',
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    status_date DATE NULL,
    comment TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_ts TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO admin_tasks (created_at, assignee, status, status_date, comment) VALUES
    (CURRENT_DATE, 'Юра', 'done', CURRENT_DATE, 'Роль «Заведующая» и разделы кабинета'),
    (CURRENT_DATE, 'Юра', 'open', NULL, 'Подключить реальные данные в «Пользователи»'),
    (CURRENT_DATE, 'Я', 'postponed', NULL, 'Выбрать второй номер для тестового сайта');