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

const db = require("../config/db");
const calculateAgeing = require("../services/ageing");

const generateExcel = require("../reports/excelReport");
const generatePDF = require("../reports/pdfReport");
const { exportCompanyPDF } = require("../controllers/exportController");

async function getFilteredInvoices(req) {

    const filters = req.query.filter || [];

    const start = req.query.start;

    const end = req.query.end;

    let where = [];

    let values = [];

    const filterArray = Array.isArray(filters)
        ? filters
        : filters
        ? [filters]
        : [];

    filterArray.forEach(filter => {

        where.push(`(

            invoice_number LIKE ?

            OR customer_name LIKE ?

            OR company_name LIKE ?

            OR payment_status LIKE ?

            OR remarks LIKE ?

        )`);

        for (let i = 0; i < 5; i++) {
            values.push(`%${filter}%`);
        }

    });

    if (start) {

        where.push("DATE(due_date)>=?");

        values.push(start);

    }

    if (end) {

        where.push("DATE(due_date)<=?");

        values.push(end);

    }

    let sql = `SELECT * FROM invoices`;

    if (where.length) {

        sql += " WHERE " + where.join(" AND ");

    }

    sql += " ORDER BY due_date ASC";

    const [rows] = await db.query(sql, values);

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

module.exports = router;