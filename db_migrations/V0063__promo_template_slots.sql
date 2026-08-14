-- Акция «12 шаблонов»: первые 12 оплат тарифа Рост на 6 месяцев получают
-- бесплатную разработку 1 шаблона документа по запросу.
CREATE TABLE IF NOT EXISTS promo_template_slots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_id INTEGER REFERENCES plan_orders(id),
    slot_number INTEGER NOT NULL,
    request_text TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'reserved',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    done_at TIMESTAMP NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_promo_slot_number ON promo_template_slots(slot_number);
CREATE UNIQUE INDEX IF NOT EXISTS uq_promo_slot_user ON promo_template_slots(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_promo_slot_order ON promo_template_slots(order_id);
