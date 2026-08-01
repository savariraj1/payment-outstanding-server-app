const ExcelJS = require("exceljs");
const path = require("path");

async function generateExcel(invoices, res) {

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Outstanding Report");

    sheet.columns = [
        { header: "Invoice No", key: "invoiceNo", width: 18 },
        { header: "Customer", key: "customer", width: 30 },
        { header: "Invoice Date", key: "invoiceDate", width: 18 },
        { header: "Due Date", key: "dueDate", width: 18 },
        { header: "Invoice Amount", key: "amount", width: 18 },
        { header: "0-30", key: "days0to30", width: 12 },
        { header: "31-60", key: "days31to60", width: 12 },
        { header: "61-90", key: "days61to90", width: 12 },
        { header: "90+", key: "days90Plus", width: 12 },
        { header: "Outstanding", key: "outstanding", width: 18 },
        { header: "Received Amount", key: "paidAmount", width: 18 },
        { header: "Status", key: "status", width: 15 }
    ];

    // Header Style
    sheet.getRow(1).font = {
        bold: true,
        size: 12
    };

    sheet.getRow(1).alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    invoices.forEach(inv => {

        const invoiceAmount = Number(inv.amount || 0);
        const paidAmount = Number(inv.paidAmount || 0);
        const outstanding = Number(inv.outstanding || 0);

        let d0 = "";
        let d31 = "";
        let d61 = "";
        let d90 = "";

        switch (inv.ageingBucket) {

            case "0-30":
                d0 = outstanding;
                break;

            case "31-60":
                d31 = outstanding;
                break;

            case "61-90":
                d61 = outstanding;
                break;

            case "90+":
                d90 = outstanding;
                break;
        }

        sheet.addRow({
            invoiceNo: inv.invoiceNo,
            customer: inv.customer,
            invoiceDate: inv.invoiceDate,
            dueDate: inv.dueDate,
            amount: invoiceAmount,
            days0to30: d0,
            days31to60: d31,
            days61to90: d61,
            days90Plus: d90,
            outstanding: outstanding,
            paidAmount: paidAmount,
            status: inv.status
        });

    });

    // Format number columns
    sheet.eachRow((row, rowNumber) => {

        if (rowNumber > 1) {

            [5,6,7,8,9,10,11].forEach(col => {
                row.getCell(col).numFmt = '#,##0';
                row.getCell(col).alignment = { horizontal: "right" };
            });

        }

    });

    // Download in browser
    if (res) {

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Outstanding_Report.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();

        return;
    }

    // Save locally (used by scheduler)
    const filePath = path.join(
        __dirname,
        "../uploads/Outstanding_Report.xlsx"
    );

    await workbook.xlsx.writeFile(filePath);

    return filePath;

}


module.exports = generateExcel;