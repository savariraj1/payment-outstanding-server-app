// const sheetService = require("../services/sheetService");
// const emailService = require("../services/emailService");

// exports.sendTestEmail = async (req, res) => {

//     try {

//         const invoices = await sheetService.getInvoices();

//         if (invoices.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No invoices found."
//             });
//         }

//         const invoice = invoices[0];

//         const info = await emailService.sendReminder(invoice);

//         res.json({
//             success: true,
//             message: "Email sent successfully.",
//             messageId: info.messageId
//         });

//     } catch (err) {

//         res.status(500).json({
//             success: false,
//             message: err.message
//         });

//     }

// };

const invoiceService = require("../services/invoiceService");
const emailService = require("../services/emailService");
const calculateAgeing = require("../services/ageing");

exports.sendTestEmail = async (req, res) => {

    try {

        // change this customer name to one existing in DB
        const customer = "ABC";

        const customerInvoices =
            await invoiceService.getCustomerOutstanding(customer);

        if (!customerInvoices || customerInvoices.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No invoices found."
            });
        }

         // ==================================================
        // CALCULATE AGEING
        // ==================================================

        const invoicesWithAgeing =
            customerInvoices
                .map(inv => {

                    const ageing =
                        calculateAgeing(
                            inv.due_date
                        );

                    return {

                        ...inv,

                        ageingBucket:
                            ageing.bucket,

                        ageingDays:
                            ageing.days

                    };

                })
                .filter(inv =>
                    Number(
                        inv.outstanding_amount || 0
                    ) > 0
                );


        // ==================================================
        // 0-30
        // ==================================================

        const zeroTo30Invoices =
            invoicesWithAgeing.filter(
                inv =>
                    inv.ageingBucket === "0-30"
            );

        // Collect all valid emails
        const emailList = [
            ...new Set(
                invoicesWithAgeing
                    .map(inv => (inv.email || "").trim())
                    .filter(email => email !== "")
            )
        ];

        if (emailList.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No customer email found."
            });
        }

        console.log("Emails Found:", emailList);

        const companyName =
            invoicesWithAgeing[0].company_name ||
            invoicesWithAgeing[0].company ||
            invoicesWithAgeing[0].customer;


        const info = await emailService.sendReminder(
                companyName,
                invoicesWithAgeing,
                emailList,
                zeroTo30Invoices
            );

        if (!sent) {

            return res.status(500).json({

                success: false,

                message:
                    "Failed to send test email."

            });

        }

        res.json({
            success: true,
            message: "Test email sent.",
            // messageId: info.messageId
        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

};