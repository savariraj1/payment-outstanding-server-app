const db = require("../config/db");

function normalizeFilters(filters) {
    const filterArray = Array.isArray(filters)
        ? filters
        : filters
        ? [filters]
        : [];

    return filterArray
        .flatMap(filter => String(filter).split(","))
        .map(filter => filter.trim())
        .filter(Boolean);
}

function buildInvoiceFilters({
    filters = [],
    start,
    end,
    company
} = {}) {

    const where = [];
    const values = [];

    const filterArray = normalizeFilters(filters);

    const ageingBuckets = new Set([
        "0-30", "31-60", "61-90", "90+", "not-due"
    ]);

    const ageingFilters = filterArray
        .filter(filter => ageingBuckets.has(String(filter).trim().toLowerCase()))
        .map(filter => String(filter).trim().toLowerCase());

    const textFilters = filterArray
        .filter(filter => !ageingBuckets.has(String(filter).trim().toLowerCase()));

    if (textFilters.length) {
        const textConditions = textFilters.map(() => `(
            LOWER(invoice_number) LIKE LOWER(?)
            OR LOWER(customer_name) LIKE LOWER(?)
            OR LOWER(company_name) LIKE LOWER(?)
            OR payment_status LIKE ?
            OR remarks LIKE ?
        )`);

        where.push(`(${textConditions.join(" OR ")})`);

        textFilters.forEach(filter => {
            for (let i = 0; i < 5; i++) {
                values.push(`%${filter}%`);
            }
        });
    }

    if (ageingFilters.length) {
        const ageingConditions = ageingFilters.map(bucket => {
            if (bucket === "not-due") {
                return "(due_date IS NULL OR due_date > CURDATE())";
            }

            if (bucket === "0-30") {
                return "due_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND CURDATE()";
            }

            if (bucket === "31-60") {
                return "due_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND DATE_SUB(CURDATE(), INTERVAL 31 DAY)";
            }

            if (bucket === "61-90") {
                return "due_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND DATE_SUB(CURDATE(), INTERVAL 61 DAY)";
            }

            return "due_date < DATE_SUB(CURDATE(), INTERVAL 90 DAY)";
        });

        where.push(`(${ageingConditions.join(" OR ")})`);
    }

    if (start) {
        where.push("h.created_at >= ?");
        values.push(`${start} 00:00:00`);
    }

    if (end) {
        where.push("h.created_at < DATE_ADD(?, INTERVAL 1 DAY)");
        values.push(`${end} 00:00:00`);
    }

    if (company) {
        where.push("company_name = ?");
        values.push(company);
    }

    return {
        where,
        values
    };

}

async function findAll(filters = {}) {

    const {
        where,
        values
    } = buildInvoiceFilters(filters);

    let sql = `
        SELECT
            i.*,
            h.file_name,
            h.created_at AS import_date
        FROM invoices i
        LEFT JOIN import_history h
            ON i.import_id = h.id
    `;

    if (where.length) {
        sql += " WHERE " + where.join(" AND ");
    }

    sql += `
        ORDER BY
            i.import_id DESC,
            h.created_at DESC,
            i.due_date ASC
        `;

    const [rows] = await db.query(sql, values);

    return rows;
}

async function findDashboardInvoices(filters = {}) {

    const {
        where,
        values
    } = buildInvoiceFilters(filters);

    const needsImportJoin = Boolean(filters.start || filters.end);

    let sql = `
        SELECT
            i.import_id,
            i.invoice_number,
            i.customer_name,
            i.company_name,
            i.email,
            i.due_date,
            i.invoice_amount,
            i.received_amount,
            i.credit_note_amount,
            i.payment_status
        FROM invoices i
    `;

    if (needsImportJoin) {
        sql += `
            LEFT JOIN import_history h
                ON i.import_id = h.id
        `;
    }

    if (where.length) {
        sql += " WHERE " + where.join(" AND ");
    }

    const [rows] = await db.query(sql, values);

    return rows;
}

async function findOutstandingInvoices(filters = {}) {

    const {
        where,
        values
    } = buildInvoiceFilters(filters);

    let sql = `
        SELECT
            i.id,
            i.import_id,
            h.created_at AS import_date,
            h.file_name,
            i.invoice_number,
            i.customer_name,
            i.company_name,
            i.invoice_date,
            i.due_date,
            i.invoice_amount,
            i.received_amount,
            i.received_date,
            i.credit_note_amount,
            i.credit_note_number,
            i.credit_note_date,
            i.outstanding_amount,
            i.payment_status,
            i.remarks,
            i.email
        FROM invoices i
        LEFT JOIN import_history h
            ON i.import_id = h.id
    `;

    if (where.length) {
        sql += " WHERE " + where.join(" AND ");
    }

    sql += `
        ORDER BY i.import_id DESC, i.due_date ASC
    `;

    const [rows] = await db.query(sql, values);

    return rows;
}

async function findOutstandingByCompany(company) {

    const [rows] = await db.query(
        `
        SELECT
            id,

            invoice_number AS invoiceNo,
            customer_name AS customer,
            company_name AS company,

            email,

            invoice_date AS invoiceDate,
            due_date AS dueDate,

            invoice_amount AS invoiceAmount,
            received_amount AS receivedAmount,
            credit_note_amount AS creditNoteAmount,

            payment_status AS paymentStatus,

            GREATEST(
                COALESCE(invoice_amount, 0)
                - COALESCE(received_amount, 0)
                - COALESCE(credit_note_amount, 0),
                0
            ) AS outstanding,

            ageing_bucket AS ageingBucket

        FROM invoices

        WHERE company_name = ?

        AND (
            COALESCE(invoice_amount, 0)
            - COALESCE(received_amount, 0)
            - COALESCE(credit_note_amount, 0)
        ) > 0

        ORDER BY due_date
        `,
        [company]
    );

    return rows;

}

async function findOutstandingCompanies() {

    const [rows] = await db.query(`
        SELECT DISTINCT company_name
        FROM invoices
        WHERE
            (
                COALESCE(invoice_amount, 0)
                - COALESCE(received_amount, 0)
                - COALESCE(credit_note_amount, 0)
            ) > 0
    `);

    return rows;

}

async function findByInvoiceNumber(invoiceNumber) {

    const [rows] = await db.query(
        "SELECT * FROM invoices WHERE invoice_number = ? LIMIT 1",
        [invoiceNumber]
    );

    return rows[0] || null;

}

async function create(invoice) {

    const [result] = await db.query(
        `
        INSERT INTO invoices
        (
            customer_name,
            company_name,
            email,
            invoice_number,
            invoice_date,
            due_date,
            invoice_amount,
            received_amount,
            received_date,
            credit_note_amount,
            credit_note_number,
            credit_note_date,
            remarks,
            paid_amount,
            outstanding_amount,
            payment_status,
            ageing_days,
            ageing_bucket,
            sync_status,
            import_id
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'Synced',
            ?
        )
        `,
        [
            invoice.customerName,
            invoice.companyName,
            invoice.email,
            invoice.invoiceNumber,
            invoice.invoiceDate,
            invoice.dueDate,
            invoice.invoiceAmount,
            invoice.receivedAmount,
            invoice.receivedDate,
            invoice.creditNoteAmount,
            invoice.creditNoteNumber,
            invoice.creditNoteDate,
            invoice.remarks,
            invoice.paidAmount,
            invoice.outstandingAmount,
            invoice.paymentStatus,
            invoice.ageingDays,
            invoice.ageingBucket,
            invoice.importId
        ]
    );

    return result;

}

async function findById(id) {

    const [rows] = await db.query(
        `
        SELECT *
        FROM invoices
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;

}

async function update(id, invoice) {

    const [result] = await db.query(
        `
        UPDATE invoices
        SET
            payment_status = ?,
            received_amount = ?,
            received_date = ?,
            credit_note_amount = ?,
            credit_note_number = ?,
            credit_note_date = ?,
            remarks = ?,
            outstanding_amount = ?,
            updated_at = NOW()
        WHERE id = ?
        `,
        [
            invoice.paymentStatus,
            invoice.receivedAmount,
            invoice.receivedDate,
            invoice.creditNoteAmount,
            invoice.creditNoteNumber,
            invoice.creditNoteDate,
            invoice.remarks,
            invoice.outstandingAmount,
            id
        ]
    );

    return result;

}

// ============================================================
// UPDATE EMAIL FOR ONE INVOICE
// ============================================================

async function updateEmail(id, email) {

    const [result] = await db.query(
        `
        UPDATE invoices
        SET
            email = ?,
            updated_at = NOW()
        WHERE id = ?
        `,
        [email, id]
    );

    return result;
}


// ============================================================
// UPDATE EMAIL FOR ALL INVOICES OF A COMPANY
// ============================================================

async function updateCompanyEmail(company, email) {

    const [result] = await db.query(
        `
        UPDATE invoices
        SET
            email = ?,
            updated_at = NOW()
        WHERE company_name = ?
        `,
        [email, company]
    );

    return result;
}

module.exports = {
    normalizeFilters,
    buildInvoiceFilters,
    findAll,
    findDashboardInvoices,
    findOutstandingInvoices,
    findOutstandingByCompany,
    findOutstandingCompanies,
    findByInvoiceNumber,
    findById,
    create,
    update,
    updateEmail,
    updateCompanyEmail
};
