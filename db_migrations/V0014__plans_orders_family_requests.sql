-- Срок действия тарифа
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP NULL;

-- Заказы на оплату тарифов через Robokassa
CREATE TABLE IF NOT EXISTS plan_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    robokassa_inv_id INTEGER UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_plan_orders_user_id ON plan_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_orders_robokassa_inv_id ON plan_orders(robokassa_inv_id);

-- Заявки на бесплатный тариф "Для родных" по кодовому слову
CREATE TABLE IF NOT EXISTS family_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    code_word VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    decided_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_family_requests_user_id ON family_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_family_requests_status ON family_requests(status);
