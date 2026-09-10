const invoiceService = require("./invoiceService");
const emailService = require("./emailService");
const reminderControlModel = require("../models/reminderControllerModel");
const calculateAgeing = require("./ageing");


// ============================================================
// AUTOMATIC REMINDERS
// ============================================================

async function sendAutomaticReminders({
    includeZeroTo30 = false
} = {}) {

    try {

        console.log("=================================");
        console.log("Automatic Reminder Started");
        console.log(
            "Include 0-30:",
            includeZeroTo30
        );
        console.log("=================================");


        const customers =
            await invoiceService.getOutstandingCustomers();


        for (const customer of customers) {

            const companyName =
                customer.company_name ||
                customer.company;


            if (!companyName) {
                continue;
            }


            // ==================================================
            // CHECK IF REMINDER IS PAUSED
            // ==================================================

            const control =
                await reminderControlModel.getByCompany(
                    companyName
                );


            if (control && control.paused_until) {

                const today = new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );


                const restartDate =
                    new Date(control.paused_until);

                restartDate.setHours(
                    0,
                    0,
                    0,
                    0
                );


                // Still paused
                if (today < restartDate) {

                    console.log(
                        `⏸ Reminder paused for ${companyName} until ${restartDate.toLocaleDateString("en-IN")}`
                    );

                    continue;
                }


                // ==================================================
                // PAUSE EXPIRED
                // ==================================================

                await reminderControlModel.clearPause(
                    companyName
                );


                console.log(
                    `▶ Reminder automatically restarted for ${companyName}`
                );
            }


            // ==================================================
            // GET OUTSTANDING INVOICES
            // ==================================================

            const customerInvoices =
                await invoiceService.getCustomerOutstanding(
                    companyName
                );


            if (
                !customerInvoices ||
                customerInvoices.length === 0
            ) {
                continue;
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


            if (invoicesWithAgeing.length === 0) {
                continue;
            }


            // ==================================================
            // 0-30 INVOICES
            // ==================================================

            const zeroTo30Invoices =
                invoicesWithAgeing.filter(
                    inv =>
                        inv.ageingBucket === "0-30"
                );


            // ==================================================
            // OTHER AGEING INVOICES
            //
            // 31-60
            // 61-90
            // 90+
            // ==================================================

            const otherAgeingInvoices =
                invoicesWithAgeing.filter(
                    inv =>
                        inv.ageingBucket !== "0-30"
                );


            // ==================================================
            // DETERMINE WHAT TO SEND
            // ==================================================

            let invoicesToSend;


            if (includeZeroTo30) {

                // Monday / Wednesday
                // Send everything

                invoicesToSend =
                    invoicesWithAgeing;

            }
            else {

                // Other days
                // Send only 31-60 / 61-90 / 90+

                invoicesToSend =
                    otherAgeingInvoices;

            }


            // ==================================================
            // NOTHING TO SEND
            // ==================================================

            if (
                !invoicesToSend ||
                invoicesToSend.length === 0
            ) {

                console.log(
                    `No applicable outstanding invoices for ${companyName}`
                );

                continue;
            }


            // ==================================================
            // GET EMAILS
            //
            // Get emails from ALL applicable invoices
            // ==================================================

            const emailList = [
                ...new Set(
                    invoicesToSend
                        .map(inv =>
                            (inv.email || "").trim()
                        )
                        .filter(Boolean)
                )
            ];


            if (emailList.length === 0) {

                console.log(
                    `No email found for ${companyName}`
                );

                continue;
            }


            // ==================================================
            // 0-30 TABLE DATA
            //
            // Only send this to template on Monday/Wednesday
            // ==================================================

            const zeroTo30ForEmail =
                includeZeroTo30
                    ? zeroTo30Invoices
                    : [];


            // ==================================================
            // SEND EMAIL
            // ==================================================

            const sent =
                await emailService.sendReminder(
                    companyName,
                    invoicesToSend,
                    emailList,
                    zeroTo30ForEmail
                );


            if (sent) {

                console.log(
                    `✅ Reminder sent to ${companyName} -> ${emailList.join(", ")}`
                );

            }
            else {

                console.log(
                    `❌ Reminder failed for ${companyName}`
                );

            }

        }


        console.log("=================================");
        console.log("Automatic Reminder Completed");
        console.log("=================================");

    }
    catch (err) {

        console.error(
            "Automatic Reminder Error"
        );

        console.error(err);

    }

}


// ============================================================
// STOP REMINDER
// ============================================================

async function stopReminder(
    companyName,
    restartDate
) {

    if (!companyName) {
        throw new Error(
            "Company name is required"
        );
    }

    if (!restartDate) {
        throw new Error(
            "Restart date is required"
        );
    }

    await reminderControlModel.setPausedUntil(
        companyName,
        restartDate
    );

}


// ============================================================
// RESTART REMINDER
// ============================================================

async function restartReminder(
    companyName
) {

    if (!companyName) {
        throw new Error(
            "Company name is required"
        );
    }

    await reminderControlModel.clearPause(
        companyName
    );
}


// ============================================================
// GET STOPPED COMPANIES
// ============================================================

async function getStoppedCompanies() {

    const rows = await reminderControlModel.getAllPaused();

    return rows.map(row => ({
        id: row.id,
        company: row.company_name,
        company_name: row.company_name,
        restartDate: row.paused_until,
        paused_until: row.paused_until,
        created_at: row.created_at,
        updated_at: row.updated_at
    }));

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    sendAutomaticReminders,
    stopReminder,
    restartReminder,
    getStoppedCompanies
};