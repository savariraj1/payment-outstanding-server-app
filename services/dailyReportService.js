const resend = require("./gmail");
const generatePDF = require("../reports/emailPdfReport");
const calculateAgeing = require("./ageing");
const invoiceModel = require("../models/invoiceModel");
const fs = require("fs");

async function sendDailyReport() {

    const rows = await invoiceModel.findAll();

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

    // Summary
    const totalInvoices = invoices.length;

    const totalOutstanding = invoices.reduce(
        (sum, inv) => sum + inv.outstanding,
        0
    );

    const totalReceived = invoices.reduce(
        (sum, inv) => sum + inv.paidAmount,
        0
    );

    const pendingInvoices = invoices.filter(
        inv => inv.outstanding > 0
    ).length;

    const { data, error } = await resend.emails.send({

        from: "Accounts <accounts@tylt.co.in>",

        to: ["raghav@tylt.co.in"],

        cc: ["raj.s@tylt.co.in"],

        subject: `Daily Outstanding Invoice Report/Outstanding Total Amount ₹${totalOutstanding.toLocaleString("en-IN")}`,

        html: `...`,

        attachments: [
            {
                filename: "Outstanding_Report.pdf",
                content: fs.readFileSync(file)
            }
        ]

    });

    if (error) {
        console.error("Daily Report Error:", error);
        return;
    }

    console.log("Daily report sent:", data.id);

}

module.exports = {
    sendDailyReport
};