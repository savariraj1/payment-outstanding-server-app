const PDFDocument = require("pdfkit");

// ================================
// Helper Functions
// ================================

function formatAmount(value) {
    return Number(value || 0).toLocaleString("en-IN");
}

function drawCell(doc, x, y, w, h, text, options = {}) {

    const {
        fill = null,
        color = "black",
        bold = false,
        align = "center",
        fontSize = 9
    } = options;

    if (fill) {
        doc.rect(x, y, w, h).fillAndStroke(fill, "#000");
    } else {
        doc.rect(x, y, w, h).stroke();
    }

    doc.fillColor(color);

    doc.font(
        bold
            ? "Helvetica-Bold"
            : "Helvetica"
    );

    doc.fontSize(fontSize);

    doc.text(
        text,
        x + 3,
        y + 8,
        {
            width: w - 6,
            align
        }
    );

    doc.fillColor("black");
}

// ================================
// Generate PDF
// ================================

function generatePDF(invoices, res) {

    const doc = new PDFDocument({

        size: "A4",

        layout: "landscape",

        margin: 10,

        bufferPages: true

    });

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=Outstanding_Report.pdf"
    );

    doc.pipe(res);

    // ===================================
    // Company Header
    // ===================================

    // Uncomment after adding logo

    /*
    doc.image(
        __dirname + "/../assets/logo.png",
        30,
        20,
        {
            width: 70
        }
    );
    */

    doc

        .font("Helvetica-Bold")

        .fontSize(22)

        .fillColor("#0d6efd")

        .text(
            "TYLT Mobility Pvt. Ltd.",
            110,
            25
        );

    doc

        .font("Helvetica")

        .fontSize(14)

        .fillColor("black")

        .text(
            "Payment Outstanding Report",
            110,
            58
        );

    const today = new Date();

    doc

        .fontSize(11)

        .text(

            "Report Date : " +
            today.toLocaleDateString("en-GB"),

            650,

            40

        );

    doc

        .moveTo(30, 90)

        .lineTo(810, 90)

        .stroke();

    // ===================================
    // Dashboard Summary
    // ===================================

    let totalOutstanding = 0;

    let totalInvoices = invoices.length;

    let pendingInvoices = 0;

    let paidInvoices = 0;

    let receivedAmount = 0;

    invoices.forEach(inv => {

        totalOutstanding += Number(inv.outstanding || 0);

        receivedAmount += Number(inv.paidAmount || 0);

        if (inv.status === "Paid") {

            paidInvoices++;

        } else {

            pendingInvoices++;

        }

    });

    const summary = [

        {
            title: "Total Outstanding",
            value: "" + formatAmount(totalOutstanding)
        },

        {
            title: "Total Invoices",
            value: totalInvoices
        },

        {
            title: "Pending Invoices",
            value: pendingInvoices
        },

        {
            title: "Paid Invoices",
            value: paidInvoices
        },

        {
            title: "Received Amount",
            value: "" + formatAmount(receivedAmount)
        }

    ];

    let cardX = 30;

    const cardWidth = 156;

    summary.forEach(card => {

        drawCell(

            doc,

            cardX,

            110,

            cardWidth,

            35,

            card.title,

            {

                fill: "#0d6efd",

                color: "white",

                bold: true,

                fontSize: 11

            }

        );

        drawCell(

            doc,

            cardX,

            145,

            cardWidth,

            40,

            String(card.value),

            {

                bold: true,

                fontSize: 18

            }

        );

        cardX += cardWidth;

    });

    // ===================================
    // Table starts here
    // ===================================

    let tableY = 210;
    // =====================================================
// TABLE COLUMN DEFINITIONS
// =====================================================

const columns = [

    { title: "Invoice No", key: "invoiceNo", width: 50 },

    { title: "Customer", key: "customer", width: 130 },

    { title: "Invoice Date", key: "invoiceDate", width: 55 },

    { title: "Due Date", key: "dueDate", width: 55 },

    { title: "Invoice Amt", key: "amount", width: 65 },

    { title: "0-30", key: "d0", width: 55 },

    { title: "31-60", key: "d31", width: 55 },

    { title: "61-90", key: "d61", width: 55 },

    { title: "90+", key: "d90", width: 55 },

    { title: "Outstanding", key: "outstanding", width: 80 },

    { title: "Received", key: "paidAmount", width: 80 },

    { title: "Status", key: "status", width: 60 }

];

// =====================================================
// DRAW TABLE HEADER
// =====================================================

let x = 30;

columns.forEach(col => {

    drawCell(

        doc,

        x,

        tableY,

        col.width,

        30,

        col.title,

        {

            fill: "#0d6efd",

            color: "white",

            bold: true,

            fontSize: 10

        }

    );

    x += col.width;

});

tableY += 30;

// =====================================================
// PREPARE TOTALS
// =====================================================

let totalInvoiceAmount = 0;

let total0to30 = 0;

let total31to60 = 0;

let total61to90 = 0;

let total90 = 0;

// =====================================================
// DRAW DATA ROWS
// =====================================================

invoices.forEach((inv, index) => {

    const amount = Number(inv.amount || 0);

    const outstanding = Number(inv.outstanding || 0);

    const paid = Number(inv.paidAmount || 0);

    totalInvoiceAmount += amount;

    let d0 = "";

    let d31 = "";

    let d61 = "";

    let d90 = "";

    switch (inv.ageingBucket) {

        case "0-30":

            d0 = formatAmount(outstanding);

            total0to30 += outstanding;

            break;

        case "31-60":

            d31 = formatAmount(outstanding);

            total31to60 += outstanding;

            break;

        case "61-90":

            d61 = formatAmount(outstanding);

            total61to90 += outstanding;

            break;

        case "90+":

            d90 = formatAmount(outstanding);

            total90 += outstanding;

            break;

    }

    const row = [

        inv.invoiceNo,

        inv.customer,

        formatDate(inv.invoiceDate),

        formatDate(inv.dueDate),

        formatAmount(amount),

        d0,

        d31,

        d61,

        d90,

        formatAmount(outstanding),

        formatAmount(paid),

        inv.status

    ];

    x = 30;

    const bgColor = index % 2 === 0 ? "#FFFFFF" : "#F7F7F7";

    row.forEach((cell, colIndex) => {

        drawCell(

            doc,

            x,

            tableY,

            columns[colIndex].width,

            24,

            String(cell),

            {

                fill: bgColor,

                align:

                    colIndex >= 4 && colIndex <= 10

                        ? "right"

                        : "center",

                fontSize: 9

            }

        );

        x += columns[colIndex].width;

    });

    tableY += 24;

    // ==========================================
    // PAGE BREAK
    // ==========================================

    if (tableY > 500) {

        doc.addPage({

            size: "A4",

            layout: "landscape",

            margin: 30

        });

        tableY = 40;

        x = 30;

        columns.forEach(col => {

            drawCell(

                doc,

                x,

                tableY,

                col.width,

                30,

                col.title,

                {

                    fill: "#0d6efd",

                    color: "white",

                    bold: true,

                    fontSize: 10

                }

            );

            x += col.width;

        });

        tableY += 30;

    }

});
// =====================================================
// GRAND TOTALS
// =====================================================

const grandTotalOutstanding =
    total0to30 +
    total31to60 +
    total61to90 +
    total90;

const grandTotalReceived = invoices.reduce(
    (sum, inv) => sum + Number(inv.paidAmount || 0),
    0
);

// Leave some gap before totals
tableY += 8;

const totalRow = [

    "TOTAL",

    "",

    "",

    "",

    formatAmount(totalInvoiceAmount),

    formatAmount(total0to30),

    formatAmount(total31to60),

    formatAmount(total61to90),

    formatAmount(total90),

    formatAmount(grandTotalOutstanding),

    formatAmount(grandTotalReceived),

    ""

];

x = 30;

totalRow.forEach((cell, index) => {

    drawCell(

        doc,

        x,

        tableY,

        columns[index].width,

        28,

        String(cell),

        {

            fill: "#D9EAD3",

            bold: true,

            align:

                index >= 4 && index <= 10

                    ? "right"

                    : "center",

            fontSize: 10

        }

    );

    x += columns[index].width;

});

tableY += 45;

// =====================================================
// FOOTER
// =====================================================

const pageRange = doc.bufferedPageRange();

for (let i = 0; i < pageRange.count; i++) {

    doc.switchToPage(i);

    doc

        .font("Helvetica")

        .fontSize(9)

        .fillColor("gray")

        .text(

            "Generated by Payment Outstanding Follow-up System",

            30,

            565

        );

    doc.text(

        "Generated On : " +

        new Date().toLocaleDateString("en-GB"),

        540,

        565

    );

    doc.text(

        `Page ${i + 1} of ${pageRange.count}`,

        735,

        565

    );

}

doc.end();

}

module.exports = generatePDF;

function formatDate(date) {

    if (!date) return "";

    return new Date(date)
        .toLocaleDateString("en-GB");

}