const calculateAgeing = require("../services/ageing");
const invoiceModel = require("../models/invoiceModel");

exports.getOutstanding = async (req, res) => {

    try {

       const filters = req.query.filter || [];

        const start = req.query.start;

        const end = req.query.end;

        const rows = await invoiceModel.findAll({
            filters,
            start,
            end
        });

        const result = rows.map(inv => {

            const ageing = calculateAgeing(inv.due_date);

            return {

                id: inv.id,

                invoiceNo: inv.invoice_number,

                customer: inv.customer_name,

                company: inv.company_name,

                dueDate: inv.due_date,

                ageingBucket: ageing.bucket,

                ageingDays: ageing.days,

                invoiceAmount: Number(inv.invoice_amount),

                received: Number(inv.received_amount),

                creditNote: Number(inv.credit_note_amount),

                outstanding: Number(inv.outstanding_amount),

                status: inv.payment_status,

                remarks: inv.remarks,

                email: inv.Email

            };

        });

        res.json({
            success: true,
            data: result
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
