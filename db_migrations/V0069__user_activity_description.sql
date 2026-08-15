ALTER TABLE t_p57647769_pwa_login_app.users
  ADD COLUMN IF NOT EXISTS activity_description TEXT;

ALTER TABLE t_p57647769_pwa_login_app.auth_codes
  ADD COLUMN IF NOT EXISTS reg_activity TEXT;