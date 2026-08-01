const invoiceService = require("./invoiceService");
const emailService = require("./emailService");

async function sendAutomaticReminders() {

    try {

        console.log("=================================");
        console.log("Automatic Reminder Started");
        console.log("=================================");

        // Get all customers having outstanding invoices
        const customers = await invoiceService.getOutstandingCustomers();

        for (const customer of customers) {

            const customerInvoices =
                await invoiceService.getCustomerOutstanding(customer.company_name);

            if (customerInvoices.length === 0)
                continue;

            // Get all unique emails
            const emailList = [
                ...new Set(
                    customerInvoices
                        .map(inv => (inv.email || "").trim())
                        .filter(email => email !== "")
                )
            ];

            if (emailList.length === 0) {
                console.log(`No email found for ${customer.company_name}`);
                continue;
            }

            await emailService.sendReminder(
                customer.company_name,
                customerInvoices,
                emailList
            );

            console.log(
                `Reminder sent to ${customer.company_name} -> ${emailList.join(", ")}`
            );
        }

        console.log("=================================");
        console.log("Automatic Reminder Completed");
        console.log("=================================");

    }
    catch (err) {

        console.error("Automatic Reminder Error");
        console.error(err);

    }

}

module.exports = {
    sendAutomaticReminders
};