const XLSX = require("xlsx");
const fs = require("fs");
const db = require("../config/db");
const excelService = require("../services/excelImportService");

exports.importExcel = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an Excel file."
            });
        }

        const workbook = XLSX.readFile(req.file.path);

        const sheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const rows =
            XLSX.utils.sheet_to_json(sheet, {
                defval: ""
            });

        if (rows.length === 0) {

            fs.unlinkSync(req.file.path);

            return res.status(400).json({
                success: false,
                message: "Excel file is empty."
            });

        }

        const duplicateInvoices = [];
        let inserted = 0;

        //-----------------------------------
        // Create Import Batch
        //-----------------------------------

        const [importResult] = await db.query(

            `INSERT INTO import_history
            (
                file_name,
                total_rows,
                inserted_rows,
                duplicate_rows
            )
            VALUES
            (
                ?,0,0,0
            )`,

            [
                req.file.originalname
            ]

        );

        const importId = importResult.insertId;

        for (const row of rows) {

            //-----------------------------------
            // Required Fields
            //-----------------------------------

            const invoiceNo =
                String(row["Invoice Number"]).trim();

            if (!invoiceNo)
                continue;

            //-----------------------------------
            // Duplicate Invoice Check
            //-----------------------------------

            const [duplicate] =
                await db.query(
                    "SELECT id FROM invoices WHERE invoice_number=?",
                    [invoiceNo]
                );

            if (duplicate.length > 0) {

                duplicateInvoices.push(invoiceNo);

                continue;

            }

            //-----------------------------------
            // Invoice Values
            //-----------------------------------

            const invoiceAmount =
                Number(row["Invoice Amount"] || 0);

            const receivedAmount =
                Number(row["Amount Received"] || 0);

            const creditAmount =
                Number(row["Credit Note Amount"] || 0);

            const outstanding =
                Math.max(
                    invoiceAmount
                    - receivedAmount
                    - creditAmount,
                    0
                );

            //-----------------------------------
            // Payment Status
            //-----------------------------------

            let paymentStatus = "Unpaid";

            if (outstanding === 0) {

                paymentStatus = "Paid";

            }
            else if (
                receivedAmount > 0 ||
                creditAmount > 0
            ) {

                paymentStatus = "Part Paid";

            }

            //-----------------------------------
            // Ageing
            //-----------------------------------

            const ageing =
                excelService.calculateAgeing(
                    row["Due Date"]
                );

            //-----------------------------------
            // Save Invoice
            //-----------------------------------

            await db.query(

                `INSERT INTO invoices
                (
                    customer_name,
                    company_name,
                    email,
                    invoice_number,
                    invoice_date,
                    due_date,
                    invoice_amount,
                    received_amount,
                    received_date,
                    credit_note_amount,
                    credit_note_date,
                    remarks,
                    paid_amount,
                    outstanding_amount,
                    payment_status,
                    ageing_days,
                    ageing_bucket,
                    sync_status,
                    import_id
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'Synced',
                    ?
                )`,

                [

                row["Customer Name"],

                row["Company Name"],

                row["Email"] || "",  

                invoiceNo,

                excelService.parseDate(
                    row["Invoice Date"]
                ),

                excelService.parseDate(
                    row["Due Date"]
                ),

                invoiceAmount,

                receivedAmount,

                excelService.parseDate(
                    row["Received Date"]
                ),

                creditAmount,

                excelService.parseDate(
                    row["Credit Note Date"]
                ),

                row["Remarks"] || "",

                receivedAmount,

                outstanding,

                paymentStatus,

                ageing.days,

                ageing.bucket,

                importId

            ]

            );

            inserted++;

        }

        //-----------------------------------
        // Save Import History
        //-----------------------------------

        await db.query(

        `UPDATE import_history
        SET

        total_rows=?,
        inserted_rows=?,
        duplicate_rows=?

        WHERE id=?`,

        [
        rows.length,
        inserted,
        duplicateInvoices.length,
        importId
        ]

        );
        fs.unlinkSync(req.file.path);

        //-----------------------------------

        if (duplicateInvoices.length > 0) {

            return res.json({

                success: false,

                message:
                    `Imported ${inserted} invoice(s).\n\nDuplicate Invoice Numbers:\n\n` +
                    duplicateInvoices.join("\n"),

                duplicates: duplicateInvoices

            });

        }

        //-----------------------------------

        res.json({

            success: true,

            message:
                `${inserted} invoice(s) imported successfully.`

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};