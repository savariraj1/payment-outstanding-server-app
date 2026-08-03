const db = require("./db");
const seedDefaultUser = require("../seeders/defaultUserSeeder");

async function createUsersTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'Manager',
            status VARCHAR(50) NOT NULL DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

async function createImportHistoryTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS import_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            file_name VARCHAR(255) NOT NULL,
            total_rows INT NOT NULL DEFAULT 0,
            inserted_rows INT NOT NULL DEFAULT 0,
            duplicate_rows INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function createInvoicesTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS invoices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(255) NOT NULL,
            company_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) DEFAULT '',
            invoice_number VARCHAR(100) NOT NULL UNIQUE,
            invoice_date DATE DEFAULT NULL,
            due_date DATE DEFAULT NULL,
            invoice_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
            received_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
            received_date DATE DEFAULT NULL,
            credit_note_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
            credit_note_number VARCHAR(100) DEFAULT NULL,
            credit_note_date DATE DEFAULT NULL,
            remarks TEXT,
            paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
            outstanding_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
            payment_status VARCHAR(50) NOT NULL DEFAULT 'Unpaid',
            ageing_days INT NOT NULL DEFAULT 0,
            ageing_bucket VARCHAR(50) NOT NULL DEFAULT 'Current',
            sync_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
            import_id INT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_invoices_company_name (company_name),
            INDEX idx_invoices_due_date (due_date),
            INDEX idx_invoices_payment_status (payment_status),
            INDEX idx_invoices_import_id (import_id),
            CONSTRAINT fk_invoices_import_history
                FOREIGN KEY (import_id)
                REFERENCES import_history(id)
                ON DELETE SET NULL
        )
    `);
}

async function createEmailHistoryTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS email_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(255) NOT NULL,
            email_to TEXT NOT NULL,
            email_cc TEXT,
            subject VARCHAR(255) NOT NULL,
            total_invoices INT NOT NULL DEFAULT 0,
            total_outstanding DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
            status VARCHAR(50) NOT NULL DEFAULT 'Sent',
            message_id VARCHAR(255) DEFAULT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function initDb() {
    await createUsersTable();
    await createImportHistoryTable();
    await createInvoicesTable();
    await createEmailHistoryTable();
    await seedDefaultUser();

    console.log("[DB] Tables ensured");
}

module.exports = initDb;
