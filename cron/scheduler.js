const cron = require("node-cron");

const sheetService = require("../services/sheetService");
const emailService = require("../services/emailService");
const { isToday } = require("../utils/dateHelper");

function startScheduler() {

    // Runs every day at 9:00 AM

    // cron.schedule("0 9 * * *", async () => { 
        cron.schedule("* * * * *", async () => {

        console.log("================================");
        console.log("Payment Reminder Scheduler");
        console.log(new Date());
        console.log("================================");

        try {

            const invoices = await sheetService.getInvoices();

            let sent = 0;

            // for (const invoice of invoices) {

            //     if (
            //         invoice.status === "Paid" ||
            //         Number(invoice.outstanding) <= 0
            //     ) {
            //         continue;
            //     }

            //     await emailService.sendReminder(invoice);
            //     await sheetService.updateLastReminder(invoice.rowNumber);

            //     console.log(
            //         `Reminder Sent : ${invoice.customer}`
            //     );

            //     sent++;

            // }
                for (const invoice of invoices) {

        // Skip paid invoices
        if (invoice.status === "Paid") {
            console.log(`${invoice.invoiceNo} - Paid`);
            continue;
        }

        // Skip zero outstanding
        if (Number(invoice.outstanding) <= 0) {
            console.log(`${invoice.invoiceNo} - No Outstanding`);
            continue;
        }

        // Skip if reminder already sent today
        if (isToday(invoice.lastReminder)) {
            console.log(`${invoice.invoiceNo} - Already reminded today`);
            continue;
        }

        try {

            if (!invoice.email || invoice.email.trim() === "") {

            console.log(`${invoice.invoiceNo} - Email Missing`);

            continue;

        }

            await emailService.sendReminder(invoice);

            await sheetService.updateLastReminder(invoice.rowNumber);

            console.log(`✅ Reminder Sent : ${invoice.customer}`);

        } catch (err) {

            console.log(`❌ Failed : ${invoice.customer}`);

            console.log(err.message);

        }

    }

            console.log(`Total Emails Sent : ${sent}`);

        } catch (err) {

            console.log(err.message);

        }

    });

}

module.exports = startScheduler;