CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_type VARCHAR(20),
  client_name VARCHAR(255),
  client_inn VARCHAR(12),
  client_ogrnip VARCHAR(15),
  client_address TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(12, 2),
  due_date DATE,
  comment TEXT,
  pdf_url TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS invoice_seq_by_user;
