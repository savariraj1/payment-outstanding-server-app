const calculateAgeing = require("./ageing");
const invoiceModel = require("../models/invoiceModel");

exports.getCustomerOutstanding = async(customer)=>{

    const rows = await invoiceModel.findOutstandingByCompany(customer);

    console.log("Rows from DB:");
console.log(rows);

    return rows.map(r=>{
        const ageing=calculateAgeing(r.dueDate);

        return{

            invoiceNo:r.invoiceNo,

            customer:r.customer,

            company:r.company,

            invoiceDate:r.invoiceDate,

            dueDate:r.dueDate,

            outstanding:Number(r.outstanding),

            email:r.email,

            ageingBucket:r.ageingBucket || ageing.bucket

        };

    });

}

async function getOutstandingCustomers() {
    return invoiceModel.findOutstandingCompanies();
}

async function getCustomerOutstanding(company) {
    return invoiceModel.findOutstandingByCompany(company);
}

module.exports = {
    getOutstandingCustomers,
    getCustomerOutstanding
};
