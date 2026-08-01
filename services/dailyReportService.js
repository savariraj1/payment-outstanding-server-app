const transporter = require("./gmail");
const generatePDF = require("../reports/emailPdfReport");
const db = require("../config/db");
const calculateAgeing = require("./ageing");

async function sendDailyReport() {

    const [rows] = await db.query(
        "SELECT * FROM invoices ORDER BY due_date ASC"
    );

    const invoices = rows.map(inv => {

        const ageing = calculateAgeing(inv.due_date);

        return {

            invoiceNo: inv.invoice_number,

            customer: inv.customer_name,

            invoiceDate: inv.invoice_date,

            dueDate: inv.due_date,

            amount: Number(inv.invoice_amount),

            paidAmount: Number(inv.received_amount),

            outstanding: Number(inv.outstanding_amount),

            status: inv.payment_status,

            ageingBucket: ageing.bucket

        };

    });

    const file = await generatePDF(invoices);

    await transporter.sendMail({

        from: process.env.GMAIL_USER,

        to: "archana@tylt.co.in",

        subject: "Daily Outstanding Report",
        text: "Attached is today's outstanding report.",

        attachments: [
            {
                filename: "Outstanding_Report.pdf",
                path: file
            }
        ]

    });

    console.log("Daily report sent.");

}

module.exports = {

    sendDailyReport

};