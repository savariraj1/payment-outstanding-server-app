const { sheets, spreadsheetId } = require("./googleSheet");
const calculateAgeing = require("./ageing");

async function getInvoices() {
    try {

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Invoices!A2:J"
        });


        const rows = response.data.values || [];
        console.log("Rows from Google Sheet:");
        


            return rows.map((row, index) => {
                // console.log(rows);
                console.log("ROW:", row);

                const ageing = calculateAgeing(row[4] || "");

                return {

                    invoiceNo: row[0] || "",

                    customer: row[1] || "",

                    email: row[2] || "",

                    invoiceDate: row[3] || "",

                    dueDate: row[4] || "",

                    amount: Number(row[5]) || 0,

                    paidAmount: Number(row[6]) || 0,

                    outstanding: Number(row[7]) || 0,

                    status: (row[8] || "").trim(),

                    lastReminder: row[9] || "",

                    remarks: row[10] || "",

                    ageingDays: ageing.days,

                    ageingBucket: ageing.bucket,

                    rowNumber: index + 2

                };

            });


    } catch (error) {

        console.error("Google Sheet Error");

        console.error(error);

        throw error;

    }
}
// async function updateLastReminder(rowNumber) {

//     const now = new Date().toISOString();

//     await sheets.spreadsheets.values.update({

//         spreadsheetId,

//         range: `Invoices!I${rowNumber}`,

//         valueInputOption: "RAW",

//         requestBody: {
//             values: [[today]]
//         }

//     });

// }
// async function updateLastReminder(rowNumber) {

//     console.log("Updating row:", rowNumber);

//     const now = new Date().toISOString();

//     await sheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: `Invoices!I${rowNumber}:J${rowNumber}`,
//         valueInputOption: "RAW",
//         requestBody: {
//             values: [[now,"Reminder Sent"]]
//         }
//     });

//     console.log("Updated successfully");
// }

async function updateLastReminder(rowNumber) {

    console.log("Updating Row:", rowNumber);

    const now = new Date().toISOString();

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Invoices!J${rowNumber}:K${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: {
            values: [
                [now, "Reminder Sent"]
            ]
        }
    });

    console.log("Last Reminder and Remarks Updated");
}

module.exports = {
    getInvoices,
    updateLastReminder
};