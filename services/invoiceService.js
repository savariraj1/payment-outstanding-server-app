const db = require("../config/db");
const calculateAgeing = require("./ageing");

exports.getCustomerOutstanding = async(customer)=>{

    const [rows]=await db.query(

        `

        SELECT *

        FROM invoices

        WHERE company_name=?

        AND outstanding_amount>0

        `,

        [customer]

    );

    console.log("Rows from DB:");
console.log(rows);

    return rows.map(r=>{

        const ageing=calculateAgeing(r.due_date);

        return{

            invoiceNo:r.invoice_number,

            customer:r.customer_name,

            company:r.company_name,

            invoiceDate:r.invoice_date,

            dueDate:r.due_date,

            outstanding:Number(r.outstanding_amount),

            email:r.email,

            ageingBucket:ageing.bucket

        };

    });

}

async function getOutstandingCustomers() {

    const [rows] = await db.query(`
        SELECT DISTINCT company_name
        FROM invoices
        WHERE outstanding_amount > 0
    `);

    return rows;
}

async function getCustomerOutstanding(company) {

    const [rows] = await db.query(

        `
        SELECT
            invoice_number AS invoiceNo,
            customer_name AS customer,
            company_name AS company,
            invoice_date AS invoiceDate,
            due_date AS dueDate,
            outstanding_amount AS outstanding,
            ageing_bucket AS ageingBucket,
            email
        FROM invoices
        WHERE company_name = ?
          AND outstanding_amount > 0
        ORDER BY due_date
        `,
        [company]

    );

    return rows;
}

module.exports = {
    getOutstandingCustomers,
    getCustomerOutstanding
};