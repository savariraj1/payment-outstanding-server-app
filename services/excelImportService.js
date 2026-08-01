const XLSX = require("xlsx");
const dayjs = require("dayjs");

const REQUIRED_COLUMNS = [
    "Invoice Number",
    "Customer Name",
    "Company Name",
    "Invoice Date",
    "Due Date",
    "Invoice Amount",
    "Amount Received",
    "Received Date",
    "Credit Note Amount",
    "Credit Note Date",
    "Status"
];

const VALID_STATUS = [
    "Unpaid",
    "Part Paid",
    "Paid"
];

/*
|--------------------------------------------------------------------------
| Read Excel
|--------------------------------------------------------------------------
*/

function readExcel(filePath) {

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json(sheet, {
        defval: ""
    });

}

/*
|--------------------------------------------------------------------------
| Validate Required Columns
|--------------------------------------------------------------------------
*/

function validateColumns(rows) {

    if (!rows.length) {

        throw new Error("Excel file is empty.");

    }

    const columns = Object.keys(rows[0]);

    const missing = REQUIRED_COLUMNS.filter(col => !columns.includes(col));

    if (missing.length) {

        throw new Error(
            "Missing Columns : " +
            missing.join(", ")
        );

    }

}

/*
|--------------------------------------------------------------------------
| Convert Excel Date
|--------------------------------------------------------------------------
*/

function parseDate(value) {

    if (!value) return null;

    // Already JS Date
    if (value instanceof Date) {

        return dayjs(value).format("YYYY-MM-DD");

    }

    // Excel Numeric Date
    if (typeof value === "number") {

        const parsed = XLSX.SSF.parse_date_code(value);

        if (!parsed) return null;

        return dayjs(
            new Date(
                parsed.y,
                parsed.m - 1,
                parsed.d
            )
        ).format("YYYY-MM-DD");

    }

    // String

    const formats = [

        "DD-MM-YYYY",

        "DD/MM/YYYY",

        "YYYY-MM-DD",

        "MM/DD/YYYY"

    ];

    for (const format of formats) {

        const d = dayjs(
            value,
            format,
            true
        );

        if (d.isValid()) {

            return d.format("YYYY-MM-DD");

        }

    }

    return null;

}

/*
|--------------------------------------------------------------------------
| Convert Amount
|--------------------------------------------------------------------------
*/

function amount(value) {

    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {

        return 0;

    }

    if (typeof value === "number") {

        return Number(value);

    }

    return Number(
        String(value)
            .replace(/,/g, "")
            .replace(/₹/g, "")
            .trim()
    ) || 0;

}

/*
|--------------------------------------------------------------------------
| Validate Status
|--------------------------------------------------------------------------
*/

function validateStatus(status) {

    if (!status) {

        return "Unpaid";

    }

    if (!VALID_STATUS.includes(status)) {

        throw new Error(
            "Invalid Status : " +
            status
        );

    }

    return status;

}

/*
|--------------------------------------------------------------------------
| Clean String
|--------------------------------------------------------------------------
*/

function text(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value).trim();

}

/*
|--------------------------------------------------------------------------
| Validate One Row
|--------------------------------------------------------------------------
*/

function validateRow(row, rowNo) {

    if (!text(row["Invoice Number"])) {

        throw new Error(
            `Row ${rowNo}: Invoice Number is required`
        );

    }

    if (!text(row["Customer Name"])) {

        throw new Error(
            `Row ${rowNo}: Customer Name is required`
        );

    }

    if (!parseDate(row["Invoice Date"])) {

        throw new Error(
            `Row ${rowNo}: Invalid Invoice Date`
        );

    }

    if (!parseDate(row["Due Date"])) {

        throw new Error(
            `Row ${rowNo}: Invalid Due Date`
        );

    }

    if (amount(row["Invoice Amount"]) <= 0) {

        throw new Error(
            `Row ${rowNo}: Invalid Invoice Amount`
        );

    }

    validateStatus(
        text(row["Status"])
    );

}

/*
|--------------------------------------------------------------------------
| Prepare Rows
|--------------------------------------------------------------------------
*/

function prepareRows(rows) {

    const prepared = [];

    rows.forEach((row, index) => {

        validateRow(
            row,
            index + 2
        );

        prepared.push({

            invoiceNumber:
                text(row["Invoice Number"]),

            customerName:
                text(row["Customer Name"]),

            companyName:
                text(row["Company Name"]),

            invoiceDate:
                parseDate(row["Invoice Date"]),

            dueDate:
                parseDate(row["Due Date"]),

            invoiceAmount:
                amount(row["Invoice Amount"]),

            receivedAmount:
                amount(row["Amount Received"]),

            receivedDate:
                parseDate(row["Received Date"]),

            creditNoteAmount:
                amount(row["Credit Note Amount"]),

            creditNoteDate:
                parseDate(row["Credit Note Date"]),

            status:
                validateStatus(
                    text(row["Status"])
                ),

            remarks:
                text(row["Remarks"])

        });

    });

    return prepared;

}

/*
|--------------------------------------------------------------------------
| Calculate Ageing
|--------------------------------------------------------------------------
*/

function calculateAgeing(dueDate) {

    const parsedDate = parseDate(dueDate);

    if (!parsedDate) {
        return {
            days: 0,
            bucket: "Current"
        };
    }

    const today = dayjs().startOf("day");
    const due = dayjs(parsedDate).startOf("day");

    const days = today.diff(due, "day");

    let bucket = "Current";

    if (days <= 0) {
        bucket = "Current";
    }
    else if (days <= 30) {
        bucket = "0-30";
    }
    else if (days <= 60) {
        bucket = "31-60";
    }
    else if (days <= 90) {
        bucket = "61-90";
    }
    else {
        bucket = "90+";
    }

    return {
        days,
        bucket
    };

}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {

    readExcel,

    validateColumns,

    prepareRows,

    amount,

    parseDate,

    calculateAgeing

};