const invoiceModel = require("../models/invoiceModel");

const calculateAgeing = require("../services/ageing");


exports.updateInvoice = async (req, res) => {

    try {

        const id = req.params.id;

        const {

            paymentStatus,
            receivedAmount,
            receivedDate,
            creditNoteAmount,
            creditNoteNumber,
            creditNoteDate,
            remarks

        } = req.body;

        const invoice =
            await invoiceModel.findById(id);

        if (!invoice) {

            return res.status(404).json({

                success: false,

                message: "Invoice not found"

            });

        }

        const invoiceAmount =
            Number(invoice.invoice_amount);

        const received =
            Number(receivedAmount || 0);

        const credit =
            Number(creditNoteAmount || 0);

        const outstanding =
            invoiceAmount -
            received -
            credit;

        await invoiceModel.update(id, {

            paymentStatus,

            receivedAmount: received,

            receivedDate: receivedDate || null,

            creditNoteAmount: credit,

            creditNoteNumber: creditNoteNumber || null,

            creditNoteDate: creditNoteDate || null,

            remarks,

            outstandingAmount: outstanding

        });

        res.json({

            success: true,

            message: "Invoice updated successfully"

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