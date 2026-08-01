const express = require("express");
const router = express.Router();

const emailController = require("../controllers/emailController");
const invoiceService=require("../services/invoiceService");
const emailService = require("../services/emailService");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth");

console.log("Email Routes Loaded");

// Test Email
router.get("/test", emailController.sendTestEmail);

router.post(
    "/send",
    authenticateToken,
    authorizeRoles("Admin", "Manager"),
    async (req, res) => {

    try {

        console.log("Request Body:", req.body);
        const { customer } = req.body;

    const customerInvoices =
    await invoiceService.getCustomerOutstanding(customer);

if (customerInvoices.length === 0) {
    return res.status(404).json({
        success: false,
        message: "No outstanding invoices found."
    });
}

// Use the first invoice only to get customer details
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

       console.log("=================================");
console.log("Emails Found:", emailList);
console.log("Outstanding Invoices:", customerInvoices.length);
console.log("=================================");

// Send one email with all invoices
const info = await emailService.sendReminder(
    customerInvoices[0].company,
    customerInvoices,
    emailList
);

        console.log("===== CUSTOMER INVOICES =====");
        console.log(JSON.stringify(customerInvoices, null, 2));
        console.log("=============================");

        console.log("Email Sent:", info.messageId);

    
        res.json({
            success: true,
            message: "Reminder sent successfully."
        });
    }catch (err) {

    console.log("====================================");
    console.log("EMAIL ERROR");
    console.log("Message:", err.message);
    console.log("Stack:");
    console.log(err.stack);
    console.log("====================================");

    res.status(500).json({
        success: false,
        message: err.message
    });

}

});

module.exports = router;