-- Данные регистрации, ожидающие подтверждения по SMS
ALTER TABLE auth_codes ADD COLUMN IF NOT EXISTS reg_email VARCHAR(255);
ALTER TABLE auth_codes ADD COLUMN IF NOT EXISTS reg_password_hash VARCHAR(255);