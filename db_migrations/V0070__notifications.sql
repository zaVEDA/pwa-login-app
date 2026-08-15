CREATE TABLE IF NOT EXISTS t_p57647769_pwa_login_app.notification_settings (
    user_id INTEGER PRIMARY KEY,
    notify_sms BOOLEAN NOT NULL DEFAULT TRUE,
    notify_email BOOLEAN NOT NULL DEFAULT TRUE,
    notify_docs BOOLEAN NOT NULL DEFAULT TRUE,
    notify_plan BOOLEAN NOT NULL DEFAULT TRUE,
    notify_news BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS t_p57647769_pwa_login_app.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'news',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON t_p57647769_pwa_login_app.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON t_p57647769_pwa_login_app.notifications (user_id, is_read);
