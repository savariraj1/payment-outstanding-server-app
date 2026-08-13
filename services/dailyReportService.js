// const resend = require("./gmail");
// const generatePDF = require("../reports/emailPdfReport");
// const calculateAgeing = require("./ageing");
// const invoiceModel = require("../models/invoiceModel");
// const fs = require("fs");

// async function sendDailyReport() {

//     const rows = await invoiceModel.findAll();

//     const invoices = rows.map(inv => {

//         const ageing = calculateAgeing(inv.due_date);

//         return {
//             invoiceNo: inv.invoice_number,
//             customer: inv.customer_name,
//             invoiceDate: inv.invoice_date,
//             dueDate: inv.due_date,
//             amount: Number(inv.invoice_amount),
//             paidAmount: Number(inv.received_amount),
//             outstanding: Number(inv.outstanding_amount),
//             status: inv.payment_status,
//             ageingBucket: ageing.bucket
//         };

//     });

//     const file = await generatePDF(invoices);

//     // Summary
//     const totalInvoices = invoices.length;

//     const totalOutstanding = invoices.reduce(
//         (sum, inv) => sum + inv.outstanding,
//         0
//     );

//     const totalReceived = invoices.reduce(
//         (sum, inv) => sum + inv.paidAmount,
//         0
//     );

//     const pendingInvoices = invoices.filter(
//         inv => inv.outstanding > 0
//     ).length;

//     const { data, error } = await resend.emails.send({

//         from: "Accounts <accounts@tylt.co.in>",

//         to: ["raghav@tylt.co.in"],

//         cc: ["raj.s@tylt.co.in"],

//         subject: `Daily Outstanding Invoice Report/Outstanding Total Amount ₹${totalOutstanding.toLocaleString("en-IN")}`,

//         html: `...`,

//         attachments: [
//             {
//                 filename: "Outstanding_Report.pdf",
//                 content: fs.readFileSync(file)
//             }
//         ]

//     });

//     if (error) {
//         console.error("Daily Report Error:", error);
//         return;
//     }

//     console.log("Daily report sent:", data.id);

// }

// module.exports = {
//     sendDailyReport
// };

const brevo = require("./gmail");
const generatePDF = require("../reports/emailPdfReport");
const calculateAgeing = require("./ageing");
const invoiceModel = require("../models/invoiceModel");
const fs = require("fs");

async function sendDailyReport() {

    const rows = await invoiceModel.findAll();

    // ==========================================================
    // ONLY OUTSTANDING INVOICES
    // Paid invoices are completely excluded
    // Part Paid invoices are included with only remaining amount
    // ==========================================================

    const outstandingRows = rows.filter(
        inv => Number(inv.outstanding_amount || 0) > 0
    );

    // ==========================================================
    // PREPARE PDF DATA
    // ==========================================================

    const invoices = outstandingRows.map(inv => {

        const ageing = calculateAgeing(inv.due_date);

        const invoiceAmount =
            Number(inv.invoice_amount || 0);

        const outstanding =
            Number(inv.outstanding_amount || 0);

        return {

            invoiceNo: inv.invoice_number,
            customer: inv.customer_name,
            company: inv.company_name,
            invoiceDate: inv.invoice_date,
            dueDate: inv.due_date,

            amount: invoiceAmount,

            paidAmount: 0,

            outstanding: outstanding,

            status: inv.payment_status,

            ageingBucket: ageing.bucket

        };

    });


    // ==========================================================
    // SUMMARY
    // ==========================================================

    const totalInvoices = rows.length;

    const pendingInvoices = rows.filter(
        inv => Number(inv.outstanding_amount || 0) > 0
    ).length;

    const paidInvoices = rows.filter(
        inv => Number(inv.outstanding_amount || 0) <= 0
    ).length;

    const totalOutstanding = rows.reduce(
        (sum, inv) =>
            sum + Number(inv.outstanding_amount || 0),
        0
    );

    const totalReceived = rows.reduce(
        (sum, inv) =>
            sum + Number(inv.received_amount || 0),
        0
    );

    const creditNoteCount = rows.filter(
        inv =>
            Number(inv.credit_note_amount || 0) > 0
    ).length;

    const creditNoteValue = rows.reduce(
        (sum, inv) =>
            sum + Number(inv.credit_note_amount || 0),
        0
    );


    // ==========================================================
    // GENERATE PDF
    // ==========================================================

    const file = await generatePDF(
        invoices,
        {
            totalInvoices,
            pendingInvoices,
            paidInvoices,
            totalOutstanding,
            totalReceived,
            creditNoteCount,
            creditNoteValue
        }
    );

    // Received amount intentionally NOT calculated
    // because this report is only for outstanding amounts.

    const html = `
        <h2>Daily Outstanding Invoice Report</h2>

        <p>
            <strong>Pending Invoices:</strong>
            ${pendingInvoices}
        </p>

        <p>
            <strong>Outstanding:</strong>
            ₹${totalOutstanding.toLocaleString("en-IN")}
        </p>

        <p>
            Paid invoices are excluded from this report.
        </p>
    `;

    // ==========================================================
    // EMAIL
    // ==========================================================

    const sendSmtpEmail = {

        sender: {
            name: "Accounts",
            email: "accounts@tylt.co.in"
        },

        to: [
            {
                email: "raghav@tylt.co.in"
            }
        ],

        cc: [
            {
                email: "raj.s@tylt.co.in"
            }
        ],

        subject:
            `Daily Outstanding Invoice Report - ₹${totalOutstanding.toLocaleString("en-IN")}`,

        htmlContent: html,

        attachment: [
            {
                name: "Outstanding_Report.pdf",

                content:
                    fs.readFileSync(file).toString("base64")
            }
        ]

    };

    try {

        await brevo.sendTransacEmail(sendSmtpEmail);

        console.log("Daily Report Sent");

    } catch (err) {

        console.error("Daily Report Error:");
        console.error(err);

    }

}

module.exports = {
    sendDailyReport
};