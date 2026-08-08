const express = require("express");
const router = express.Router();

const emailController = require("../controllers/emailController");
const invoiceService = require("../services/invoiceService");
const emailService = require("../services/emailService");
const reminderService = require("../services/reminderService");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth");

console.log("Email Routes Loaded");


// ============================================================
// TEST EMAIL
// ============================================================

router.get(
    "/test",
    emailController.sendTestEmail
);


// ============================================================
// SEND MANUAL REMINDER
// ============================================================

router.post(
    "/send",
    authenticateToken,
    authorizeRoles("Admin", "Manager"),
    async (req, res) => {

        try {

            console.log("Request Body:", req.body);

            const { customer } = req.body;

            if (!customer) {

                return res.status(400).json({
                    success: false,
                    message: "Company name is required."
                });

            }

            const customerInvoices =
                await invoiceService.getCustomerOutstanding(customer);

            if (customerInvoices.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "No outstanding invoices found."
                });

            }

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

            console.log("=================================");
            console.log("Emails Found:", emailList);
            console.log(
                "Outstanding Invoices:",
                customerInvoices.length
            );
            console.log("=================================");


            await emailService.sendReminder(
                customerInvoices[0].company,
                customerInvoices,
                emailList
            );


            res.json({
                success: true,
                message: "Reminder sent successfully."
            });

        }
        catch (err) {

            console.error("EMAIL ERROR");
            console.error(err);

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }
);


// ============================================================
// GET STOPPED COMPANIES
// ============================================================

router.get(
    "/stopped",
    authenticateToken,
    authorizeRoles("Admin", "Manager"),
    async (req, res) => {

        try {

            const stoppedCompanies =
                await reminderService.getStoppedCompanies();

            res.json({

                success: true,

                data: stoppedCompanies

            });

        }
        catch (err) {

            console.error(
                "GET STOPPED COMPANIES ERROR:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);


// ============================================================
// GET COMPANIES FOR STOP DROPDOWN
// ============================================================

router.get(
    "/companies",
    authenticateToken,
    authorizeRoles("Admin", "Manager"),
    async (req, res) => {

        try {

            const companies =
                await invoiceService.getOutstandingCustomers();

            const companyList = [
                ...new Set(
                    companies
                        .map(item =>
                            item.company_name ||
                            item.company
                        )
                        .filter(Boolean)
                )
            ];

            res.json({

                success: true,

                data: companyList

            });

        }
        catch (err) {

            console.error(
                "GET COMPANIES ERROR:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);


// ============================================================
// STOP COMPANY
// ============================================================

router.post(
    "/stop",
    authenticateToken,
    authorizeRoles("Admin", "Manager"),
    async (req, res) => {

        try {

            const {
                company,
                restartDate
            } = req.body;


            if (!company) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Company name is required."

                });

            }


            if (!restartDate) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Restart date is required."

                });

            }


            const restart =
                new Date(restartDate);


            if (isNaN(restart.getTime())) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid restart date."

                });

            }


            await reminderService.stopReminder(
                company,
                restartDate
            );


            res.json({

                success: true,

                message:
                    `Reminder stopped for ${company} until ${restartDate}.`

            });

        }
        catch (err) {

            console.error(
                "STOP COMPANY ERROR:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);


// ============================================================
// RESTART COMPANY
// ============================================================

router.post(
    "/restart",
    authenticateToken,
    authorizeRoles("Admin", "Manager"),
    async (req, res) => {

        try {

            const { company } = req.body;


            if (!company) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Company name is required."

                });

            }


            await reminderService.restartReminder(
                company
            );


            res.json({

                success: true,

                message:
                    `Reminder restarted for ${company}.`

            });

        }
        catch (err) {

            console.error(
                "RESTART COMPANY ERROR:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);


module.exports = router;