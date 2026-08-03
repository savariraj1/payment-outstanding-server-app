const db = require("../config/db");

function buildInvoiceFilters({
    filters = [],
    start,
    end,
    company
} = {}) {

    const where = [];
    const values = [];

    const filterArray = Array.isArray(filters)
        ? filters
        : filters
        ? [filters]
        : [];

    filterArray.forEach(filter => {

        where.push(`(
            invoice_number LIKE ?
            OR customer_name LIKE ?
            OR company_name LIKE ?
            OR payment_status LIKE ?
            OR remarks LIKE ?
        )`);

        for (let i = 0; i < 5; i++) {
            values.push(`%${filter}%`);
        }

    });

    if (start) {
        where.push("DATE(h.created_at) >= ?");
        values.push(start);
    }

    if (end) {
        where.push("DATE(h.created_at) <= ?");
        values.push(end);
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

async function findOutstandingByCompany(company) {

    const [rows] = await db.query(
        `
        SELECT
            invoice_number AS invoiceNo,
            customer_name AS customer,
            company_name AS company,
            invoice_date AS invoiceDate,
            due_date AS dueDate,
            outstanding_amount AS outstanding,
            ageing_bucket AS ageingBucket,
            email
        FROM invoices
        WHERE company_name = ?
          AND outstanding_amount > 0
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
        WHERE outstanding_amount > 0
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

module.exports = {
    buildInvoiceFilters,
    findAll,
    findOutstandingByCompany,
    findOutstandingCompanies,
    findByInvoiceNumber,
    findById,
    create,
    update
};
