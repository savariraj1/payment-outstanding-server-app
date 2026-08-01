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

exports.sendTestEmail = async (req, res) => {

    try {

        // change this customer name to one existing in DB
        const customer = "ABC";

        const customerInvoices =
            await invoiceService.getCustomerOutstanding(customer);

        if (customerInvoices.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No invoices found."
            });
        }

        // Collect all valid emails
        const emailList = [
            ...new Set(
                customerInvoices
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

        const info = await emailService.sendReminder(
            customerInvoices[0].company || customerInvoices[0].customer,
            customerInvoices,
            emailList
        );

        res.json({
            success: true,
            message: "Test email sent.",
            messageId: info.messageId
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