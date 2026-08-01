const db = require("../config/db");

async function saveHistory(data) {

    const sql = `
        INSERT INTO email_history
        (
            customer_name,
            email_to,
            email_cc,
            subject,
            total_invoices,
            total_outstanding,
            status,
            message_id
        )
        VALUES (?,?,?,?,?,?,?,?)
    `;

    await db.execute(sql, [

        data.customer,

        data.to,

        data.cc,

        data.subject,

        data.invoiceCount,

        data.outstanding,

        data.status,

        data.messageId

    ]);
}

async function getHistory() {

    const [rows] = await db.execute(`
        SELECT *
        FROM email_history
        ORDER BY sent_at DESC
    `);

    return rows;
}

module.exports = {

    saveHistory,

    getHistory

};