CREATE TABLE captcha_challenges (
    id SERIAL PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    target_x INTEGER NOT NULL,
    tolerance INTEGER NOT NULL DEFAULT 6,
    canvas_width INTEGER NOT NULL,
    canvas_height INTEGER NOT NULL,
    piece_width INTEGER NOT NULL,
    piece_height INTEGER NOT NULL,
    piece_y INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    pass_token VARCHAR(64),
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_captcha_token ON captcha_challenges(token);
CREATE INDEX idx_captcha_pass_token ON captcha_challenges(pass_token);
