const invoiceModel = require("../models/invoiceModel");

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

        console.log("=================================");
        console.log("UPDATE INVOICE");
        console.log("Invoice ID:", id);
        console.log("Request Body:", req.body);
        console.log("=================================");

        // FIND INVOICE
        const invoice = await invoiceModel.findById(id);

        if (!invoice) {

            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });

        }

        const invoiceAmount =
            Number(invoice.invoice_amount || 0);

        let finalReceivedAmount =
            Number(receivedAmount || 0);

        let finalCreditAmount =
            Number(creditNoteAmount || 0);

        let finalPaymentStatus;
        let outstanding;

        // =====================================================
        // PAID
        // =====================================================

        if (paymentStatus === "Paid") {

            // Entire invoice is considered cleared
            finalReceivedAmount = invoiceAmount;

            finalCreditAmount = 0;

            outstanding = 0;

            finalPaymentStatus = "Paid";

        }

        // =====================================================
        // CREDIT NOTE
        // =====================================================

        else if (paymentStatus === "Credit Note") {

            outstanding = Math.max(
                invoiceAmount -
                finalReceivedAmount -
                finalCreditAmount,
                0
            );

            if (outstanding === 0) {
                finalPaymentStatus = "Paid";
            }
            else if (
                finalReceivedAmount > 0 ||
                finalCreditAmount > 0
            ) {
                finalPaymentStatus = "Part Paid";
            }
            else {
                finalPaymentStatus = "Unpaid";
            }

        }

        // =====================================================
        // PART PAID
        // =====================================================

        else {

            outstanding = Math.max(
                invoiceAmount -
                finalReceivedAmount -
                finalCreditAmount,
                0
            );

            if (outstanding === 0) {

                finalPaymentStatus = "Paid";

            }
            else if (
                finalReceivedAmount > 0 ||
                finalCreditAmount > 0
            ) {

                finalPaymentStatus = "Part Paid";

            }
            else {

                finalPaymentStatus = "Unpaid";

            }

        }

        console.log("Invoice Amount:", invoiceAmount);
        console.log("Final Received:", finalReceivedAmount);
        console.log("Final Credit:", finalCreditAmount);
        console.log("Outstanding:", outstanding);
        console.log("Final Status:", finalPaymentStatus);

        // =====================================================
        // UPDATE
        // =====================================================

        const result = await invoiceModel.update(id, {

            paymentStatus: finalPaymentStatus,

            receivedAmount: finalReceivedAmount,

            receivedDate: receivedDate || null,

            creditNoteAmount: finalCreditAmount,

            creditNoteNumber:
                creditNoteNumber || null,

            creditNoteDate:
                creditNoteDate || null,

            remarks:
                remarks || null,

            paidAmount:
                finalReceivedAmount,

            outstandingAmount:
                outstanding

        });

        console.log("UPDATE RESULT:", result);

        if (!result || result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Invoice was not updated"

            });

        }

        // GET UPDATED INVOICE
        const updatedInvoice =
            await invoiceModel.findById(id);

        console.log(
            "UPDATED INVOICE:",
            updatedInvoice
        );

        return res.json({

            success: true,

            message:
                "Invoice updated successfully",

            data: {

                id: updatedInvoice.id,

                invoiceAmount:
                    Number(updatedInvoice.invoice_amount),

                receivedAmount:
                    Number(updatedInvoice.received_amount),

                creditNoteAmount:
                    Number(updatedInvoice.credit_note_amount),

                outstandingAmount:
                    Number(updatedInvoice.outstanding_amount),

                paymentStatus:
                    updatedInvoice.payment_status,

                receivedDate:
                    updatedInvoice.received_date,

                remarks:
                    updatedInvoice.remarks

            }

        });

    }
    catch (err) {

        console.error(
            "UPDATE INVOICE ERROR:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};