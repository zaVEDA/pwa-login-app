-- Анкета на разработку шаблона (акция «12 шаблонов»)
CREATE TABLE IF NOT EXISTS template_briefs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    slot_id INTEGER REFERENCES promo_template_slots(id),
    sample_file_url TEXT NULL,
    sample_notes TEXT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_briefs_user ON template_briefs(user_id);
