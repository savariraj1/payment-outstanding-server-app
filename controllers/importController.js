const XLSX = require("xlsx");
const fs = require("fs");
const excelService = require("../services/excelImportService");
const importHistoryModel = require("../models/importHistoryModel");
const invoiceModel = require("../models/invoiceModel");

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

        const importResult =
            await importHistoryModel.createImportBatch(
                req.file.originalname
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

            const duplicate =
                await invoiceModel.findByInvoiceNumber(invoiceNo);

            if (duplicate) {

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

            await invoiceModel.create({
                customerName: row["Customer Name"],
                companyName: row["Company Name"],
                email: row["Email"] || "",
                invoiceNumber: invoiceNo,
                invoiceDate: excelService.parseDate(
                    row["Invoice Date"]
                ),
                dueDate: excelService.parseDate(
                    row["Due Date"]
                ),
                invoiceAmount,
                receivedAmount,
                receivedDate: excelService.parseDate(
                    row["Received Date"]
                ),
                creditNoteAmount: creditAmount,
                creditNoteDate: excelService.parseDate(
                    row["Credit Note Date"]
                ),
                remarks: row["Remarks"] || "",
                paidAmount: receivedAmount,
                outstandingAmount: outstanding,
                paymentStatus,
                ageingDays: ageing.days,
                ageingBucket: ageing.bucket,
                importId
            });

            inserted++;

        }

        //-----------------------------------
        // Save Import History
        //-----------------------------------

        await importHistoryModel.updateImportBatch(
            importId,
            {
                totalRows: rows.length,
                insertedRows: inserted,
                duplicateRows: duplicateInvoices.length
            }
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
