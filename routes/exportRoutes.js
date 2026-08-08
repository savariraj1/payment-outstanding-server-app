// const express = require("express");
// const router = express.Router();

// const sheetService = require("../services/sheetService");
// const generateExcel = require("../reports/excelReport");
// const generatePDF = require("../reports/pdfReport");


// // ===========================
// // Export Excel
// // ===========================
// router.get("/excel", async (req, res) => {

//     try {

//         const invoices = await sheetService.getInvoices();

//         await generateExcel(invoices, res);

//     } catch (err) {

//         console.error(err);

//         res.status(500).json({
//             success: false,
//             message: err.message
//         });

//     }

// });

// // ===========================
// // Export PDF
// // ===========================
// router.get("/pdf", async (req, res) => {

//     try {

//         const invoices = await sheetService.getInvoices();

//         generatePDF(invoices, res);

//     } catch (err) {

//         console.error(err);

//         res.status(500).json({
//             success: false,
//             message: err.message
//         });

//     }

// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const calculateAgeing = require("../services/ageing");
const invoiceModel = require("../models/invoiceModel");

const generateExcel = require("../reports/excelReport");
const generatePDF = require("../reports/pdfReport");
const generateCompanyAgingExcel = require("../reports/companyAgingExcel");
const { exportCompanyPDF } = require("../controllers/exportController");

async function getFilteredInvoices(req) {

    const rows = await invoiceModel.findAll({
        filters: req.query.filter || [],
        start: req.query.start,
        end: req.query.end
    });

    return rows.map(inv => {

        const ageing = calculateAgeing(inv.due_date);

        return {

            id: inv.id,

            invoiceNo: inv.invoice_number,

            customer: inv.customer_name,

            company: inv.company_name,

            invoiceDate: inv.invoice_date,

            dueDate: inv.due_date,

            amount: Number(inv.invoice_amount),

            paidAmount: Number(inv.received_amount),

            outstanding: Number(inv.outstanding_amount),

            status: inv.payment_status,

            ageingBucket: ageing.bucket

        };

    });

}

// Excel
router.get("/excel", async (req, res) => {

    try {

        const invoices = await getFilteredInvoices(req);

        await generateExcel(invoices, res);

    }
    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// PDF
router.get("/pdf", async (req, res) => {

    try {

        const invoices = await getFilteredInvoices(req);

        generatePDF(invoices, res);

    }
    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.get(
    "/pdf/company",
    exportCompanyPDF
);

// ==========================================================
// COMPANY-WISE AGEING EXCEL
// ==========================================================

router.get("/excel/company", async (req, res) => {

    try {

        const invoices = await getFilteredInvoices(req);

        await generateCompanyAgingExcel(
            invoices,
            res
        );

    }
    catch (err) {

        console.error(
            "Company Ageing Excel Error:",
            err
        );

        if (!res.headersSent) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

});

module.exports = router;
