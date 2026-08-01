const db = require("../config/db");
const calculateAgeing = require("../services/ageing");

async function getDashboard(req, res) {

    try {

        const [imports] = await db.query(`
        SELECT id
        FROM import_history
        ORDER BY id DESC
        LIMIT 2
        `);

        const latestImport =
            imports.length > 0
                ? imports[0].id
                : 0;

        const previousImport =
            imports.length > 1
                ? imports[1].id
                : latestImport;

        const filters = req.query.filter || [];

        const start = req.query.start;

        const end = req.query.end;

        const currentDate = start
            ? new Date(start)
            : new Date();

        currentDate.setHours(0,0,0,0);

        const previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate()-1);

        const previousDateString =
            previousDate.toISOString().split("T")[0];

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

        const [invoices]=await db.query(sql,values);

        const previousSummary = {
            totalOutstanding:0,
            totalInvoices:0,
            pendingInvoices:0,
            paidInvoices:0,
            paidInvoiceAmount:0,
            creditNoteCount:0,
            creditNoteValue:0
        };

        const currentSummary = {
            totalOutstanding:0,
            totalInvoices:0,
            pendingInvoices:0,
            paidInvoices:0,
            paidInvoiceAmount:0,
            creditNoteCount:0,
            creditNoteValue:0
        };

        let totalOutstanding = 0;
        let totalInvoices = invoices.length;
        let pendingInvoices = 0;
        let paidInvoices = 0;
        let paidInvoiceAmount = 0;
        let creditNoteCount = 0;
        let creditNoteValue = 0;

        const ageing = {
            "0-30": 0,
            "31-60": 0,
            "61-90": 0,
            "90+": 0
        };

        const outstandingByBucket = {
            "0-30": 0,
            "31-60": 0,
            "61-90": 0,
            "90+": 0
        };

        const companySummary = {};

        invoices.forEach(invoice => {

            // if (invoice.payment_status === "Paid") {
            //     paidInvoices++;
            //     return;
            // }

            const invoiceAmount = Number(invoice.invoice_amount || 0);

            const received = Number(invoice.received_amount || 0);

            const credit = Number(invoice.credit_note_amount || 0);

            const outstanding =
                invoiceAmount - received - credit;

            //-----------------------------------
            // Previous Import
            //-----------------------------------

            if(invoice.import_id <= previousImport){

                previousSummary.totalInvoices++;

                previousSummary.totalOutstanding += outstanding;

                previousSummary.paidInvoiceAmount += received;

                if(invoice.payment_status==="Paid")
                    previousSummary.paidInvoices++;
                else
                    previousSummary.pendingInvoices++;

                if(credit>0){
                    previousSummary.creditNoteCount++;
                    previousSummary.creditNoteValue += credit;
                }

            }

            //-----------------------------------
            // Current Import
            //-----------------------------------

            if(invoice.import_id <= latestImport){

                currentSummary.totalInvoices++;

                currentSummary.totalOutstanding += outstanding;

                currentSummary.paidInvoiceAmount += received;

                if(invoice.payment_status==="Paid")
                    currentSummary.paidInvoices++;
                else
                    currentSummary.pendingInvoices++;

                if(credit>0){

                    currentSummary.creditNoteCount++;

                    currentSummary.creditNoteValue += credit;

                }

            }

            if(outstanding <= 0)
                return;

            if (credit > 0) {

                creditNoteCount++;

                creditNoteValue += credit;

            }

            totalOutstanding += outstanding;
            paidInvoiceAmount += received;

            if (invoice.payment_status === "Paid") {
                paidInvoices++;
            } else {
                pendingInvoices++;
            }

            // Only latest import is used for charts and table

            const ageingInfo = calculateAgeing(invoice.due_date);

            const company = invoice.company_name;

            if(!companySummary[company]){

                companySummary[company]={

                    company,

                    "0-30":0,

                    "31-60":0,

                    "61-90":0,

                    "90+":0,

                    total:0,

                    invoices:[]
                };

            }

            companySummary[company][ageingInfo.bucket]+=outstanding;

            companySummary[company].total+=outstanding;

            companySummary[company].invoices.push({

                invoiceNo:invoice.invoice_number,

                customer:invoice.customer_name,

                dueDate:invoice.due_date,

                outstanding,

                email:invoice.email

            });

            ageing[ageingInfo.bucket]++;

            outstandingByBucket[ageingInfo.bucket]+=outstanding;

        });

        const dashboardRows = Object.values(companySummary);

        res.json({

            success: true,

            data: {

                previousSummary,

                currentSummary,

                totalOutstanding,

                totalInvoices,

                pendingInvoices,

                paidInvoices,

                paidInvoiceAmount,

                creditNoteCount,

                creditNoteValue,

                ageing,

                outstandingByBucket,

                dashboardRows

            }

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

module.exports = {
    getDashboard
};