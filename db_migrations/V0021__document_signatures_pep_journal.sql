-- Журнал подписаний документов простой электронной подписью (ПЭП).
-- Доказательная база по 63-ФЗ: кто, какой документ, каким кодом и когда подписал.
-- Запись создаётся в момент успешного ввода SMS-кода и НЕ изменяется впоследствии.
CREATE TABLE IF NOT EXISTS document_signatures (
    id SERIAL PRIMARY KEY,

    -- Что подписано
    document_id INTEGER,                    -- ссылка на documents.id (акт/накладная); NULL для согласия/договора вне таблицы documents
    subject_type VARCHAR(30) NOT NULL,      -- 'document' | 'consent_pep' | 'contract' | 'offer'
    doc_type VARCHAR(20),                   -- 'act' | 'invoice_note' и т.п. (дублируем на момент подписания)
    doc_number VARCHAR(50),                 -- номер документа на момент подписания
    doc_snapshot JSONB,                     -- слепок содержимого документа (для неизменности доказательства)

    -- Кто подписал
    signer_user_id INTEGER,                 -- пользователь-исполнитель (если подписывает он)
    signer_role VARCHAR(20) NOT NULL DEFAULT 'client', -- 'client' | 'executor'
    signer_name VARCHAR(255),               -- ФИО подписанта на момент подписания
    signer_phone VARCHAR(30) NOT NULL,      -- номер, на который отправлен код (сама ПЭП)

    -- Чем подписал (SMS-код)
    auth_code_id INTEGER,                   -- ссылка на auth_codes.id
    code VARCHAR(10) NOT NULL,              -- введённый код (фиксируем факт)
    code_sent_at TIMESTAMP,                 -- когда код отправлен
    signed_at TIMESTAMP NOT NULL DEFAULT NOW(), -- когда код введён = момент подписания

    -- Контекст подписания (для доказательной силы)
    ip_address VARCHAR(64),                 -- IP подписанта
    user_agent TEXT,                        -- устройство/браузер
    consent_text_hash VARCHAR(128),         -- хеш текста соглашения/документа, с которым согласился подписант

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS doc_signatures_document_idx ON document_signatures (document_id);
CREATE INDEX IF NOT EXISTS doc_signatures_signer_phone_idx ON document_signatures (signer_phone);
CREATE INDEX IF NOT EXISTS doc_signatures_signer_user_idx ON document_signatures (signer_user_id);
CREATE INDEX IF NOT EXISTS doc_signatures_signed_at_idx ON document_signatures (signed_at);
