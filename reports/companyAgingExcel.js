const ExcelJS = require("exceljs");

async function generateCompanyAgingExcel(invoices, res) {

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Company Ageing");

    // ==========================================================
    // COLUMNS
    // ==========================================================

    sheet.columns = [
        {
            header: "Company",
            key: "company",
            width: 30
        },
        {
            header: "Invoices",
            key: "invoiceCount",
            width: 12
        },
        {
            header: "Invoice Amt",
            key: "invoiceAmount",
            width: 18
        },
        {
            header: "0-30",
            key: "ageing0to30",
            width: 16
        },
        {
            header: "31-60",
            key: "ageing31to60",
            width: 16
        },
        {
            header: "61-90",
            key: "ageing61to90",
            width: 16
        },
        {
            header: "90+",
            key: "ageing90Plus",
            width: 16
        },
        {
            header: "Outstanding",
            key: "outstanding",
            width: 18
        },
        {
            header: "Received",
            key: "received",
            width: 18
        }
    ];


    // ==========================================================
    // GROUP BY COMPANY
    // ==========================================================

    const companies = {};


    invoices.forEach(inv => {

        const company =
            inv.company || "Unknown Company";

        if (!companies[company]) {

            companies[company] = {

                company,

                invoiceCount: 0,

                invoiceAmount: 0,

                ageing0to30: 0,

                ageing31to60: 0,

                ageing61to90: 0,

                ageing90Plus: 0,

                outstanding: 0,

                received: 0

            };

        }


        const companyData = companies[company];


        // ------------------------------------------------------
        // Invoice values
        // ------------------------------------------------------

        const invoiceAmount =
            Number(inv.amount || 0);

        const received =
            Number(inv.paidAmount || 0);

        const outstanding =
            Number(inv.outstanding || 0);


        companyData.invoiceCount++;

        companyData.invoiceAmount += invoiceAmount;

        companyData.received += received;

        companyData.outstanding += outstanding;


        // ------------------------------------------------------
        // IMPORTANT:
        //
        // ONLY OUTSTANDING GOES INTO AGEING
        //
        // Received amount is NOT added here.
        // ------------------------------------------------------

        switch (inv.ageingBucket) {

            case "0-30":

                companyData.ageing0to30 += outstanding;

                break;


            case "31-60":

                companyData.ageing31to60 += outstanding;

                break;


            case "61-90":

                companyData.ageing61to90 += outstanding;

                break;


            case "90+":

                companyData.ageing90Plus += outstanding;

                break;

        }

    });


    const companyRows =
        Object.values(companies);


    // ==========================================================
    // HEADER STYLE
    // ==========================================================

    const headerRow = sheet.getRow(1);

    headerRow.font = {
        bold: true,
        size: 12,
        color: {
            argb: "FFFFFFFF"
        }
    };

    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FF0D6EFD"
        }
    };

    headerRow.alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    headerRow.height = 25;


    // ==========================================================
    // COMPANY ROWS
    // ==========================================================

    let grandInvoiceCount = 0;

    let grandInvoiceAmount = 0;

    let grand0to30 = 0;

    let grand31to60 = 0;

    let grand61to90 = 0;

    let grand90Plus = 0;

    let grandOutstanding = 0;

    let grandReceived = 0;


    companyRows.forEach((company, index) => {

        grandInvoiceCount +=
            company.invoiceCount;

        grandInvoiceAmount +=
            company.invoiceAmount;

        grand0to30 +=
            company.ageing0to30;

        grand31to60 +=
            company.ageing31to60;

        grand61to90 +=
            company.ageing61to90;

        grand90Plus +=
            company.ageing90Plus;

        grandOutstanding +=
            company.outstanding;

        grandReceived +=
            company.received;


        const row = sheet.addRow({

            company:
                company.company,

            invoiceCount:
                company.invoiceCount,

            invoiceAmount:
                company.invoiceAmount,

            ageing0to30:
                company.ageing0to30,

            ageing31to60:
                company.ageing31to60,

            ageing61to90:
                company.ageing61to90,

            ageing90Plus:
                company.ageing90Plus,

            outstanding:
                company.outstanding,

            received:
                company.received

        });


        // Alternate row
        if (index % 2 === 1) {

            row.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: "FFF7F7F7"
                }
            };

        }

    });


    // ==========================================================
    // GRAND TOTAL
    // ==========================================================

    const totalRow = sheet.addRow({

        company: "GRAND TOTAL",

        invoiceCount:
            grandInvoiceCount,

        invoiceAmount:
            grandInvoiceAmount,

        ageing0to30:
            grand0to30,

        ageing31to60:
            grand31to60,

        ageing61to90:
            grand61to90,

        ageing90Plus:
            grand90Plus,

        outstanding:
            grandOutstanding,

        received:
            grandReceived

    });


    totalRow.font = {
        bold: true
    };

    totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FFD9EAD3"
        }
    };


    // ==========================================================
    // NUMBER FORMATTING
    // ==========================================================

    sheet.eachRow((row, rowNumber) => {

        if (rowNumber >= 2) {

            [
                3,
                4,
                5,
                6,
                7,
                8,
                9
            ].forEach(column => {

                row.getCell(column).numFmt =
                    '₹#,##0';

                row.getCell(column).alignment = {
                    horizontal: "right"
                };

            });


            row.getCell(2).alignment = {
                horizontal: "center"
            };

        }

    });


    // ==========================================================
    // BORDERS
    // ==========================================================

    sheet.eachRow(row => {

        row.eachCell(cell => {

            cell.border = {

                top: {
                    style: "thin",
                    color: {
                        argb: "FFCCCCCC"
                    }
                },

                bottom: {
                    style: "thin",
                    color: {
                        argb: "FFCCCCCC"
                    }
                },

                left: {
                    style: "thin",
                    color: {
                        argb: "FFCCCCCC"
                    }
                },

                right: {
                    style: "thin",
                    color: {
                        argb: "FFCCCCCC"
                    }
                }

            };

        });

    });


    // ==========================================================
    // FREEZE HEADER
    // ==========================================================

    sheet.views = [
        {
            state: "frozen",
            ySplit: 1
        }
    ];


    // ==========================================================
    // FILTER
    // ==========================================================

    sheet.autoFilter = {
        from: "A1",
        to: "I1"
    };


    // ==========================================================
    // DOWNLOAD
    // ==========================================================

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=Company_Ageing_Report.xlsx"
    );


    await workbook.xlsx.write(res);

    res.end();

}


module.exports = generateCompanyAgingExcel;