const generatePDF = require("../reports/pdfReport");
const invoiceModel = require("../models/invoiceModel");

exports.exportCompanyPDF = async (req, res) => {

    try {

        const company = req.query.company;

        const rows = await invoiceModel.findAll({
            company,
            start: req.query.start,
            end: req.query.end
        });

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
