CREATE TABLE IF NOT EXISTS t_p57647769_pwa_login_app.plan_reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    stage VARCHAR(30) NOT NULL,
    expires_on DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_reminders_uniq
    ON t_p57647769_pwa_login_app.plan_reminders (user_id, stage, expires_on);
