const calculateAgeing = require("./ageing");
const invoiceModel = require("../models/invoiceModel");

async function getCustomerOutstanding(company) {

    const rows =
        await invoiceModel.findOutstandingByCompany(company);

    console.log("Rows from DB:");
    console.log(rows);

    return rows
        .map(r => {

            const outstanding = Number(r.outstanding || 0);

            // Safety check
            if (outstanding <= 0) {
                return null;
            }

            const ageing =
                calculateAgeing(r.dueDate);

            return {

                id: r.id,

                invoiceNo: r.invoiceNo,

                customer: r.customer,

                company: r.company,

                email: r.email,

                invoiceDate: r.invoiceDate,

                dueDate: r.dueDate,

                invoiceAmount: Number(r.invoiceAmount || 0),

                receivedAmount: Number(r.receivedAmount || 0),

                creditNoteAmount:
                    Number(r.creditNoteAmount || 0),

                outstanding,

                paymentStatus: r.paymentStatus,

                ageingBucket:
                    r.ageingBucket || ageing.bucket

            };

        })
        .filter(Boolean);

}

async function getOutstandingCustomers() {

    return invoiceModel.findOutstandingCompanies();

}

module.exports = {
    getOutstandingCustomers,
    getCustomerOutstanding
};