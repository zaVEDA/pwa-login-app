-- Настройки кодового слова для бесплатного тарифа "Для родных" (единая строка настроек, редактируется администратором)
CREATE TABLE IF NOT EXISTS family_code_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    code_word VARCHAR(255),
    expires_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT family_code_settings_single_row CHECK (id = 1)
);