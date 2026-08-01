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

                importId: inv.import_id,

                importDate: inv.imported_at,

                importFile: inv.file_name,

                invoiceNo: inv.invoice_number,

                customer: inv.customer_name,

                company: inv.company_name,

                invoiceDate: inv.invoice_date,

                dueDate: inv.due_date,

                invoiceAmount: Number(inv.invoice_amount),

                received: Number(inv.received_amount),

                receivedDate: inv.received_date,

                creditNote: Number(inv.credit_note_amount),

                creditNoteNumber: inv.credit_note_number,

                creditNoteDate: inv.credit_note_date,

                outstanding: Number(inv.outstanding_amount),

                paymentStatus: inv.payment_status,

                remarks: inv.remarks,

                email: inv.email,

                ageingBucket: ageing.bucket,

                ageingDays: ageing.days

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
