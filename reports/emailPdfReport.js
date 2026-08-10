const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function formatAmount(value) {

    return Number(value || 0)
        .toLocaleString("en-IN");

}

function drawCell(
    doc,
    x,
    y,
    w,
    h,
    text,
    options = {}
) {

    const {
        fill = null,
        color = "black",
        bold = false,
        align = "center",
        fontSize = 9
    } = options;

    if (fill) {

        doc
            .rect(x, y, w, h)
            .fillAndStroke(fill, "#000");

    } else {

        doc
            .rect(x, y, w, h)
            .stroke();

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


// ==========================================================
// GROUP INVOICES COMPANY-WISE
// ==========================================================

function groupInvoicesByCompany(invoices) {

    const companies = {};

    invoices.forEach(inv => {

        // Safety check
        const outstanding =
            Number(inv.outstanding || 0);

        // Paid invoices should never enter report
        if (outstanding <= 0) {
            return;
        }

        const company =
            inv.company || "Unknown Company";

        if (!companies[company]) {

            companies[company] = {

                company,

                invoiceCount: 0,

                invoiceAmount: 0,

                outstanding: 0,

                total0to30: 0,

                total31to60: 0,

                total61to90: 0,

                total90Plus: 0

            };

        }

        const companyData =
            companies[company];

        const invoiceAmount =
            Number(inv.amount || 0);

        companyData.invoiceCount++;

        companyData.invoiceAmount +=
            invoiceAmount;

        companyData.outstanding +=
            outstanding;


        // ======================================================
        // AGEING
        // Only outstanding amount is placed into ageing bucket
        // ======================================================

        switch (inv.ageingBucket) {

            case "0-30":

                companyData.total0to30 +=
                    outstanding;

                break;


            case "31-60":

                companyData.total31to60 +=
                    outstanding;

                break;


            case "61-90":

                companyData.total61to90 +=
                    outstanding;

                break;


            case "90+":

                companyData.total90Plus +=
                    outstanding;

                break;

        }

    });

    return Object.values(companies);

}


// ==========================================================
// GENERATE PDF
// ==========================================================

async function generatePDF(invoices, summaryData = {}) {

    return new Promise((resolve, reject) => {

        const uploadDir =
            path.join(__dirname, "../uploads");

        if (!fs.existsSync(uploadDir)) {

            fs.mkdirSync(uploadDir, {
                recursive: true
            });

        }

        const filePath =
            path.join(
                uploadDir,
                "Outstanding_Report.pdf"
            );

        const doc =
            new PDFDocument({

                size: "A4",

                layout: "landscape",

                margin: 10,

                bufferPages: true

            });

        const stream =
            fs.createWriteStream(filePath);

        doc.pipe(stream);


        // ======================================================
        // GROUP
        // ======================================================

        const companies =
            groupInvoicesByCompany(invoices);

        const {
            totalInvoices = 0,
            pendingInvoices = 0,
            paidInvoices = 0,
            totalOutstanding = 0,
            totalReceived = 0,
            creditNoteCount = 0,
            creditNoteValue = 0
        } = summaryData;


        // ======================================================
        // HEADER
        // ======================================================

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

        doc
            .fontSize(11)
            .text(
                "Report Date : " +
                new Date()
                    .toLocaleDateString("en-GB"),
                650,
                40
            );

        doc
            .moveTo(30, 90)
            .lineTo(810, 90)
            .stroke();


        // ======================================================
        // SUMMARY
        // ======================================================

        // ======================================================
        // SUMMARY CARDS
        // ======================================================

        const summary = [

            {
                title: "Total Outstanding",
                value: `₹${formatAmount(totalOutstanding)}`
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
                title: "Total Received",
                value: `₹${formatAmount(totalReceived)}`
            },

            {
                title: "Credit Notes",
                value: creditNoteCount
            },

            {
                title: "Credit Note Value",
                value: `₹${formatAmount(creditNoteValue)}`
            },

            {
                title: "Companies",
                value: companies.length
            }

        ];

        // ======================================================
        // DRAW SUMMARY CARDS
        // ======================================================

        const cardWidth = 190;
        const cardTitleHeight = 28;
        const cardValueHeight = 38;
        const cardGap = 5;

        summary.forEach((card, index) => {

            const column = index % 4;
            const row = Math.floor(index / 4);

            const cardX =
                30 + column * (cardWidth + cardGap);

            const cardY =
                110 + row * 75;

            // Card title
            drawCell(
                doc,
                cardX,
                cardY,
                cardWidth,
                cardTitleHeight,
                card.title,
                {
                    fill: "#0d6efd",
                    color: "white",
                    bold: true,
                    fontSize: 9
                }
            );

            // Card value
            drawCell(
                doc,
                cardX,
                cardY + cardTitleHeight,
                cardWidth,
                cardValueHeight,
                card.value,
                {
                    bold: true,
                    fontSize: 15
                }
            );

        });

        // ======================================================
        // TABLE
        // ======================================================

        let tableY = 285;


        const columns = [

            {
                title: "Company",
                width: 175
            },

            {
                title: "Invoices",
                width: 55
            },

            {
                title: "Invoice Amt",
                width: 85
            },

            {
                title: "0-30",
                width: 65
            },

            {
                title: "31-60",
                width: 65
            },

            {
                title: "61-90",
                width: 65
            },

            {
                title: "90+",
                width: 65
            },

            {
                title: "Outstanding",
                width: 95
            }

        ];


        // ======================================================
        // TABLE HEADER
        // ======================================================

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
                    bold: true
                }
            );

            x += col.width;

        });


        tableY += 30;


        // ======================================================
        // GRAND TOTALS
        // ======================================================

        let grandInvoiceCount = 0;

        let grandInvoiceAmount = 0;

        let grand0 = 0;

        let grand31 = 0;

        let grand61 = 0;

        let grand90 = 0;

        let grandOutstanding = 0;


        // ======================================================
        // COMPANY ROWS
        // ======================================================

        companies.forEach(
            (company, index) => {

                grandInvoiceCount +=
                    company.invoiceCount;

                grandInvoiceAmount +=
                    company.invoiceAmount;

                grand0 +=
                    company.total0to30;

                grand31 +=
                    company.total31to60;

                grand61 +=
                    company.total61to90;

                grand90 +=
                    company.total90Plus;

                grandOutstanding +=
                    company.outstanding;


                const row = [

                    company.company,

                    company.invoiceCount,

                    formatAmount(
                        company.invoiceAmount
                    ),

                    formatAmount(
                        company.total0to30
                    ),

                    formatAmount(
                        company.total31to60
                    ),

                    formatAmount(
                        company.total61to90
                    ),

                    formatAmount(
                        company.total90Plus
                    ),

                    formatAmount(
                        company.outstanding
                    )

                ];


                x = 30;


                row.forEach(
                    (cell, i) => {

                        drawCell(
                            doc,
                            x,
                            tableY,
                            columns[i].width,
                            28,
                            cell,
                            {

                                fill:
                                    index % 2
                                        ? "#F7F7F7"
                                        : "#FFFFFF",

                                bold:
                                    i === 0,

                                align:
                                    i >= 2
                                        ? "right"
                                        : "center"

                            }
                        );

                        x +=
                            columns[i].width;

                    }
                );


                tableY += 28;


                // ==================================================
                // NEW PAGE
                // ==================================================

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
                                bold: true
                            }
                        );

                        x += col.width;

                    });


                    tableY += 30;

                }

            }
        );


        // ======================================================
        // GRAND TOTAL
        // ======================================================

        const totals = [

            "GRAND TOTAL",

            grandInvoiceCount,

            formatAmount(
                grandInvoiceAmount
            ),

            formatAmount(grand0),

            formatAmount(grand31),

            formatAmount(grand61),

            formatAmount(grand90),

            formatAmount(
                grandOutstanding
            )

        ];


        x = 30;


        totals.forEach(
            (cell, i) => {

                drawCell(
                    doc,
                    x,
                    tableY + 10,
                    columns[i].width,
                    30,
                    cell,
                    {

                        fill: "#D9EAD3",

                        bold: true,

                        align:
                            i >= 2
                                ? "right"
                                : "center"

                    }
                );

                x +=
                    columns[i].width;

            }
        );


        // ======================================================
        // FOOTER
        // ======================================================

        const pages =
            doc.bufferedPageRange();


        for (
            let i = 0;
            i < pages.count;
            i++
        ) {

            doc.switchToPage(i);

            doc.fontSize(9);

            doc.text(
                "Generated by Payment Outstanding Follow-up System",
                30,
                565
            );

            doc.text(
                "Generated On : " +
                new Date()
                    .toLocaleDateString("en-GB"),
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


        stream.on(
            "finish",
            () => resolve(filePath)
        );

        stream.on(
            "error",
            reject
        );

    });

}


module.exports = generatePDF;