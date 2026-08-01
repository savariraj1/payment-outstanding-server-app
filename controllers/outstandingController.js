const db = require("../config/db");
const calculateAgeing = require("../services/ageing");

exports.getOutstanding = async (req, res) => {

    try {

       const filters = req.query.filter || [];

        const start = req.query.start;

        const end = req.query.end;

        let where = [];

        let values = [];

        const filterArray = Array.isArray(filters)
            ? filters
            : filters
            ? [filters]
            : [];

        filterArray.forEach(filter=>{

            where.push(`(

                invoice_number LIKE ?

                OR customer_name LIKE ?

                OR company_name LIKE ?

                OR payment_status LIKE ?

                OR remarks LIKE ?

            )`);

            for(let i=0;i<5;i++)
                values.push(`%${filter}%`);

        });

        if(start){

            where.push(`DATE(due_date)>=?`);

            values.push(start);

        }

        if(end){

            where.push(`DATE(due_date)<=?`);

            values.push(end);

        }

        let sql=`

        SELECT *

        FROM invoices

        `;

        if(where.length){

            sql+=" WHERE "+where.join(" AND ");

        }

        sql+=" ORDER BY due_date ASC";

        const [rows]=await db.query(sql,values);

        const result = rows.map(inv => {

            const ageing = calculateAgeing(inv.due_date);

            return {

                id: inv.id,

                invoiceNo: inv.invoice_number,

                customer: inv.customer_name,

                company: inv.company_name,

                dueDate: inv.due_date,

                ageingBucket: ageing.bucket,

                ageingDays: ageing.days,

                invoiceAmount: Number(inv.invoice_amount),

                received: Number(inv.received_amount),

                creditNote: Number(inv.credit_note_amount),

                outstanding: Number(inv.outstanding_amount),

                status: inv.payment_status,

                remarks: inv.remarks,

                email: inv.Email

            };

        });

        res.json({
            success: true,
            data: result
        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};