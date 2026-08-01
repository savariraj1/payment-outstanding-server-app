const invoices = rows.map(row => {

    const invoiceNo = row[0];
    const customer = row[1];
    const amount = row[5];

    return {
    invoiceNo,
    customer,
    amount
};

});
const calculateAgeing = require("./ageingService");

const ageing = calculateAgeing(row[4]); // Due Date column


return {
    invoiceNo,
    customer,
    amount,
    ageingDays: ageing.days,
    ageingBucket: ageing.bucket
};