ALTER TABLE trial_codes ADD COLUMN IF NOT EXISTS partner_user_id INTEGER NULL REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_trial_codes_partner ON trial_codes(partner_user_id);