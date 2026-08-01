const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function formatAmount(value) {
    return Number(value || 0).toLocaleString("en-IN");
}

function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
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
        String(text ?? ""),
        x + 3,
        y + 8,
        {
            width: w - 6,
            align
        }
    );

    doc.fillColor("black");
}

async function generatePDF(invoices) {

    return new Promise((resolve, reject) => {

        const uploadDir = path.join(__dirname, "../uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, "Outstanding_Report.pdf");

        const doc = new PDFDocument({
            size: "A4",
            layout: "landscape",
            margin: 10,
            bufferPages: true
        });

        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // ==========================================================
        // HEADER
        // ==========================================================

        doc
            .font("Helvetica-Bold")
            .fontSize(22)
            .fillColor("#0d6efd")
            .text("TYLT Mobility Pvt. Ltd.", 110, 25);

        doc
            .font("Helvetica")
            .fontSize(14)
            .fillColor("black")
            .text("Payment Outstanding Report", 110, 58);

        doc
            .fontSize(11)
            .text(
                "Report Date : " +
                new Date().toLocaleDateString("en-GB"),
                650,
                40
            );

        doc.moveTo(30, 90).lineTo(810, 90).stroke();

        // ==========================================================
        // SUMMARY
        // ==========================================================

        let totalOutstanding = 0;
        let totalInvoices = invoices.length;
        let pendingInvoices = 0;
        let paidInvoices = 0;
        let receivedAmount = 0;

        invoices.forEach(inv => {

            totalOutstanding += Number(inv.outstanding || 0);
            receivedAmount += Number(inv.paidAmount || 0);

            if (inv.status === "Paid")
                paidInvoices++;
            else
                pendingInvoices++;

        });

        const summary = [

            {
                title: "Total Outstanding",
                value: formatAmount(totalOutstanding)
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
                value: formatAmount(receivedAmount)
            }

        ];

        let cardX = 30;

        summary.forEach(card => {

            drawCell(doc, cardX, 110, 156, 35, card.title, {
                fill: "#0d6efd",
                color: "white",
                bold: true,
                fontSize: 11
            });

            drawCell(doc, cardX, 145, 156, 40, card.value, {
                bold: true,
                fontSize: 18
            });

            cardX += 156;

        });

        // ==========================================================
        // TABLE
        // ==========================================================

        let tableY = 210;

        const columns = [

            { title: "Invoice No", width: 50 },

            { title: "Customer", width: 130 },

            { title: "Invoice Date", width: 55 },

            { title: "Due Date", width: 55 },

            { title: "Invoice Amt", width: 65 },

            { title: "0-30", width: 55 },

            { title: "31-60", width: 55 },

            { title: "61-90", width: 55 },

            { title: "90+", width: 55 },

            { title: "Outstanding", width: 80 },

            { title: "Received", width: 80 },

            { title: "Status", width: 60 }

        ];

        let x = 30;

        columns.forEach(col => {

            drawCell(doc, x, tableY, col.width, 30, col.title, {
                fill: "#0d6efd",
                color: "white",
                bold: true
            });

            x += col.width;

        });

        tableY += 30;

        let totalInvoiceAmount = 0;
        let total0 = 0;
        let total31 = 0;
        let total61 = 0;
        let total90 = 0;

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
                    total0 += outstanding;
                    break;

                case "31-60":
                    d31 = formatAmount(outstanding);
                    total31 += outstanding;
                    break;

                case "61-90":
                    d61 = formatAmount(outstanding);
                    total61 += outstanding;
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

            row.forEach((cell, i) => {

                drawCell(
                    doc,
                    x,
                    tableY,
                    columns[i].width,
                    24,
                    cell,
                    {
                        fill: index % 2 ? "#F7F7F7" : "#FFFFFF",
                        align: i >= 4 && i <= 10 ? "right" : "center"
                    }
                );

                x += columns[i].width;

            });

            tableY += 24;

            if (tableY > 500) {

                doc.addPage({
                    size: "A4",
                    layout: "landscape",
                    margin: 30
                });

                tableY = 40;

                x = 30;

                columns.forEach(col => {

                    drawCell(doc, x, tableY, col.width, 30, col.title, {
                        fill: "#0d6efd",
                        color: "white",
                        bold: true
                    });

                    x += col.width;

                });

                tableY += 30;

            }

        });

        const totals = [

            "TOTAL",
            "",
            "",
            "",
            formatAmount(totalInvoiceAmount),
            formatAmount(total0),
            formatAmount(total31),
            formatAmount(total61),
            formatAmount(total90),
            formatAmount(total0 + total31 + total61 + total90),
            formatAmount(receivedAmount),
            ""

        ];

        x = 30;

        totals.forEach((cell, i) => {

            drawCell(doc, x, tableY + 10, columns[i].width, 28, cell, {
                fill: "#D9EAD3",
                bold: true,
                align: i >= 4 && i <= 10 ? "right" : "center"
            });

            x += columns[i].width;

        });

        const pages = doc.bufferedPageRange();

        for (let i = 0; i < pages.count; i++) {

            doc.switchToPage(i);

            doc.fontSize(9);

            doc.text(
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
                `Page ${i + 1} of ${pages.count}`,
                735,
                565
            );

        }

        doc.end();

        stream.on("finish", () => resolve(filePath));

        stream.on("error", reject);

    });

}

module.exports = generatePDF;