const invoiceService = require("./invoiceService");
const emailService = require("./emailService");
const reminderControlModel = require("../models/reminderControllerModel");


// ============================================================
// AUTOMATIC REMINDERS
// ============================================================

async function sendAutomaticReminders() {

    try {

        console.log("=================================");
        console.log("Automatic Reminder Started");
        console.log("=================================");

        const customers =
            await invoiceService.getOutstandingCustomers();

        for (const customer of customers) {

            const companyName =
                customer.company_name || customer.company;

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
                // PAUSE EXPIRED -> AUTOMATICALLY RESTART
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
            // GET EMAILS
            // ==================================================

            const emailList = [
                ...new Set(
                    customerInvoices
                        .map(inv =>
                            (inv.email || "").trim()
                        )
                        .filter(email =>
                            email !== ""
                        )
                )
            ];


            if (emailList.length === 0) {

                console.log(
                    `No email found for ${companyName}`
                );

                continue;
            }


            // ==================================================
            // SEND EMAIL
            // ==================================================

            await emailService.sendReminder(
                companyName,
                customerInvoices,
                emailList
            );


            console.log(
                `Reminder sent to ${companyName} -> ${emailList.join(", ")}`
            );
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

    const rows =
        await reminderControlModel.getAllPaused();


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