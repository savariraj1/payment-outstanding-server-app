const db = require("../config/db");
const generatePDF = require("../reports/pdfReport");

exports.exportCompanyPDF = async (req, res) => {

    try {

        const company = req.query.company;

        let sql = `
        SELECT *
        FROM invoices
        WHERE company_name = ?
        `;

        let values = [company];

        if(req.query.start){

            sql += " AND DATE(due_date)>=?";
            values.push(req.query.start);

        }

        if(req.query.end){

            sql += " AND DATE(due_date)<=?";
            values.push(req.query.end);

        }

        const [rows] = await db.query(sql, values);

        const invoices = rows.map(r => ({

            invoiceNo: r.invoice_number,

            customer: r.customer_name,

            invoiceDate: formatDate(r.invoice_date),

            dueDate: formatDate(r.due_date),

            amount: r.invoice_amount,

            outstanding: r.outstanding_amount,

            paidAmount: r.received_amount,

            status: r.payment_status,

            ageingBucket: r.ageing_bucket

        }));

        generatePDF(invoices, res);

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

};

function formatDate(date) {

    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GB");

}