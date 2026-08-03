const transporter = require("./gmail");
const generatePDF = require("../reports/emailPdfReport");
const calculateAgeing = require("./ageing");
const invoiceModel = require("../models/invoiceModel");

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

    await transporter.sendMail({

        from: process.env.GMAIL_USER,

        to: "raghav@tylt.co.in",   // or your preferred recipient

        cc: "raj.s@tylt.co.in",

        subject: `Daily Outstanding Invoice Report/Outstanding Total Amount ₹${totalOutstanding.toLocaleString("en-IN")}`,

        html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">

            <h2 style="color:#0d6efd;">
                Daily Outstanding Invoice Report
            </h2>

            <p>Dear Sir/Madam,</p>

            <p>
                Please find attached the latest Outstanding Invoice Report.
                The report contains the current status of all outstanding
                invoices along with their ageing details.
            </p>

            <table style="border-collapse:collapse;width:420px;margin:20px 0;">

                <tr>
                    <td style="padding:8px;border:1px solid #ddd;">
                        Total Invoices
                    </td>
                    <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">
                        ${totalInvoices}
                    </td>
                </tr>

                <tr>
                    <td style="padding:8px;border:1px solid #ddd;">
                        Pending Invoices
                    </td>
                    <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">
                        ${pendingInvoices}
                    </td>
                </tr>

                <tr>
                    <td style="padding:8px;border:1px solid #ddd;">
                        Amount Received
                    </td>
                    <td style="padding:8px;border:1px solid #ddd;font-weight:bold;color:green;">
                        ₹${totalReceived.toLocaleString("en-IN")}
                    </td>
                </tr>

                <tr>
                    <td style="padding:8px;border:1px solid #ddd;">
                        Outstanding Amount
                    </td>
                    <td style="padding:8px;border:1px solid #ddd;font-weight:bold;color:red;">
                        ₹${totalOutstanding.toLocaleString("en-IN")}
                    </td>
                </tr>

            </table>

            <p>
                <strong>Outstanding Amount Remaining:</strong>
                ₹${totalOutstanding.toLocaleString("en-IN")}
            </p>

            <p>
                Kindly review the attached report and initiate the necessary
                follow-up actions for pending payments.
            </p>

            <br>

            <p>Regards,</p>

            <p><strong>Payment Outstanding System</strong></p>

        </div>
        `,

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