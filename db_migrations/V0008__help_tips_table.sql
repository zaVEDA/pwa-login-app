-- Раздел «Справка» — общие подсказки, доступны всем пользователям
CREATE TABLE IF NOT EXISTS help_tips (
    id SERIAL PRIMARY KEY,
    tip_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO help_tips (tip_key, title, body, category, sort_order) VALUES
('doc_act', 'Акт выполненных работ', 'Если вы оказываете услугу, производите что-то по заказу или сдаёте что-то в аренду.', 'documents', 1),
('doc_invoice_note', 'Товарная накладная', 'Если вы продаёте или перепродаёте готовый товар.', 'documents', 2)
ON CONFLICT (tip_key) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, category = EXCLUDED.category, sort_order = EXCLUDED.sort_order, updated_at = NOW();