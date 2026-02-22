CREATE TABLE IF NOT EXISTS invoices (
    id                SERIAL PRIMARY KEY,
    invoice_number    VARCHAR(100),
    vendor_name       VARCHAR(255),
    invoice_date      DATE,
    amount            DECIMAL(12,2),
    tax_amount        DECIMAL(12,2),
    total_amount      DECIMAL(12,2),
    payment_status    VARCHAR(20) DEFAULT 'unknown',
    source_file       VARCHAR(500) NOT NULL,
    upload_timestamp  TIMESTAMP DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS upload_logs (
    id                SERIAL PRIMARY KEY,
    filename          VARCHAR(500),
    file_type         VARCHAR(20),
    records_extracted INTEGER DEFAULT 0,
    uploaded_at       TIMESTAMP DEFAULT NOW(),
    status            VARCHAR(20)
);
