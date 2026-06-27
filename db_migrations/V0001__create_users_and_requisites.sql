CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requisites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  entity_type VARCHAR(20),
  full_name VARCHAR(255),
  inn VARCHAR(12),
  ogrnip VARCHAR(15),
  address TEXT,
  bik VARCHAR(9),
  bank_name VARCHAR(255),
  corr_account VARCHAR(20),
  checking_account VARCHAR(20),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);