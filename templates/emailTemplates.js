// function getEmailTemplate(invoice) {

//     let subject = "";
//     let heading = "";
//     let message = "";

//     // switch (invoice.ageingBucket) {

//     //     case "0-30 Days":

//     //         subject = `Friendly Payment Reminder - ${invoice.invoiceNo}`;

//     //         heading = "Friendly Payment Reminder";

//     //         message = `
//     //             Hope you are doing well.

//     //             This is a friendly reminder that the following invoice is outstanding.
//     //             Kindly arrange the payment at your earliest convenience.
//     //         `;

//     //         break;

//     //     case "31-60 Days":

//     //         subject = `Second Payment Reminder - ${invoice.invoiceNo}`;

//     //         heading = "Second Reminder";

//     //         message = `
//     //             Our records indicate that the payment for the below invoice is still pending.

//     //             We request you to process the payment as soon as possible.
//     //         `;

//     //         break;

//     //     case "61-90 Days":

//     //         subject = `Urgent Payment Reminder - ${invoice.invoiceNo}`;

//     //         heading = "Urgent Reminder";

//     //         message = `
//     //             The payment for the following invoice has crossed 60 days.

//     //             Kindly treat this as urgent and arrange payment immediately.
//     //         `;

//     //         break;

//     //     default:

//     //         subject = `Final Payment Reminder - ${invoice.invoiceNo}`;

//     //         heading = "Final Reminder";

//     //         message = `
//     //             Despite previous reminders, the payment remains outstanding.

//     //             Kindly clear the outstanding amount immediately to avoid service interruption.
//     //         `;

//     // }

//     const outstanding = Number(invoice.outstanding || 0);
    

//         switch (invoice.ageingBucket) {

//             case "0-30":
//                 dashboard.ageing["0-30"]++;
//                 outstandingByBucket["0-30"] += outstanding;
//                 break;

//             case "31-60":
//                 dashboard.ageing["31-60"]++;
//                 outstandingByBucket["31-60"] += outstanding;
//                 break;

//             case "61-90":
//                 dashboard.ageing["61-90"]++;
//                 outstandingByBucket["61-90"] += outstanding;
//                 break;

//             default:
//                 dashboard.ageing["90+"]++;
//                 outstandingByBucket["90+"] += outstanding;
//         }
//     return {

//         subject,

//         html: `

//         <div style="font-family:Arial;padding:30px">

//             <h2 style="color:#1565C0">
//                 ${heading}
//             </h2>

//             <p>Dear <strong>${invoice.customer}</strong>,</p>

//             <p>${message}</p>

//             <table
//                 style="
//                     border-collapse:collapse;
//                     width:100%;
//                     margin-top:20px;
//                 "
//                 border="1"
//                 cellpadding="10">

//                 <tr>
//                     <th align="left">Invoice No</th>
//                     <td>${invoice.invoiceNo}</td>
//                 </tr>

//                 <tr>
//                     <th align="left">Invoice Date</th>
//                     <td>${invoice.invoiceDate}</td>
//                 </tr>

//                 <tr>
//                     <th align="left">Due Date</th>
//                     <td>${invoice.dueDate}</td>
//                 </tr>

//                 <tr>
//                     <th align="left">Outstanding</th>
//                     <td>₹${invoice.outstanding}</td>
//                 </tr>

//                 <tr>
//                     <th align="left">Ageing</th>
//                     <td>${invoice.ageingBucket}</td>
//                 </tr>

//             </table>

//             <br>

//             <p>
//                 We appreciate your prompt attention to this matter.
//             </p>

//             <br>

//             <p>
//                 Regards,<br>
//                 <strong>Accounts Team</strong><br>
//                 TYLT Mobility
//             </p>

//         </div>

//         `

//     };

// }

// module.exports = getEmailTemplate;

function getEmailTemplate(customerName, invoices) {

    const subject = `Payment Reminder – ${customerName}`;

    let total0to30 = 0;
    let total31to60 = 0;
    let total61to90 = 0;
    let total90Plus = 0;

    let rows = "";


    invoices.forEach(inv => {
        console.log("--------------------------------");
        console.log("Invoice :", inv.invoiceNo);
        console.log("Outstanding :", inv.outstanding);
        console.log("Outstanding Type :", typeof inv.outstanding);
        console.log("Bucket :", inv.ageingBucket);
        console.log("--------------------------------");

        const outstanding = Number(inv.outstanding  || 0);

        let bucket0to30 = "";
        let bucket31to60 = "";
        let bucket61to90 = "";
        let bucket90Plus = "";

        const invoiceDate = inv.invoiceDate
            ? new Date(inv.invoiceDate).toLocaleDateString("en-GB")
            : "";

        const dueDate = inv.dueDate
            ? new Date(inv.dueDate).toLocaleDateString("en-GB")
            : "";


        // switch (inv.ageingBucket) {

        //     case "0-30 Days":
        //         bucket0to30 = "₹" + outstanding.toLocaleString("en-IN");
        //         total0to30 += outstanding;
        //         break;

        //     case "31-60 Days":
        //         bucket31to60 = "₹" + outstanding.toLocaleString("en-IN");
        //         total31to60 += outstanding;
        //         break;

        //     case "61-90 Days":
        //         bucket61to90 = "₹" + outstanding.toLocaleString("en-IN");
        //         total61to90 += outstanding;
        //         break;

        //     case ">90 Days":
        //         bucket90Plus = "₹" + outstanding.toLocaleString("en-IN");
        //         total90Plus += outstanding;
        //         break;
        // }

        switch (inv.ageingBucket) {

            case "0-30":
                bucket0to30 = "₹" + Number(outstanding).toLocaleString("en-IN");
                total0to30 += Number(outstanding);
                break;

            case "31-60":
                bucket31to60 = "₹" + Number(outstanding).toLocaleString("en-IN");
                total31to60 += Number(outstanding);
                break;

            case "61-90":
                bucket61to90 = "₹" + Number(outstanding).toLocaleString("en-IN");
                total61to90 += Number(outstanding);
                break;

            case "90+":
                bucket90Plus = "₹" + Number(outstanding).toLocaleString("en-IN");
                total90Plus += Number(outstanding);
                break;

            default:
                console.log("Unknown Bucket:", inv.ageingBucket);
        }

        rows += `
        <tr>
            <td>${inv.invoiceNo}</td>
            <td>${inv.customer}</td>
            <td>${invoiceDate}</td>
            <td>${dueDate}</td>
            <td align="right">${bucket0to30}</td>
            <td align="right">${bucket31to60}</td>
            <td align="right">${bucket61to90}</td>
            <td align="right">${bucket90Plus}</td>
        </tr>
        `;

    });

    return {

        subject,

        html: `
        <div style="font-family:Arial,sans-serif;font-size:14px">

            <p><strong>Dear Sir / Madam,</strong></p>

            <p>We hope you are doing well.</p>

            <p>
                This is a friendly reminder that the following invoices are currently outstanding.
            </p>

            <table
                border="1"
                cellpadding="8"
                cellspacing="0"
                style="border-collapse:collapse;width:100%;text-align:center;">

                <thead>

                    <tr style="background:#0d6efd;color:#ffffff">

                        <th>Invoice No</th>
                        <th>Customer</th>
                        <th>Invoice Date</th>
                        <th>Due Date</th>
                        <th>0-30</th>
                        <th>31-60</th>
                        <th>61-90</th>
                        <th>&gt;90</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                    <tr style="background:#f2f2f2;font-weight:bold">

                        <td colspan="4" align="right">
                            Total Outstanding
                        </td>

                        <td align="right">
                            ₹${total0to30.toLocaleString("en-IN")}
                        </td>

                        <td align="right">
                            ₹${total31to60.toLocaleString("en-IN")}
                        </td>

                        <td align="right">
                            ₹${total61to90.toLocaleString("en-IN")}
                        </td>

                        <td align="right">
                            ₹${total90Plus.toLocaleString("en-IN")}
                        </td>

                    </tr>

                    <tr style="background:#e8f4ff;font-weight:bold">

                        <td colspan="7" align="right">
                            Grand Total Outstanding
                        </td>

                        <td align="right">
                            ₹${(
                                total0to30 +
                                total31to60 +
                                total61to90 +
                                total90Plus
                            ).toLocaleString("en-IN")}
                        </td>

                    </tr>

                </tbody>

            </table>

            <br>

            <p>
                Kindly arrange payment at your earliest convenience. If payment has already been made, please ignore this email and share the payment reference for our records.
            </p>

            <p>
                For any clarification, please contact our Accounts Team.
            </p>

            <br>

            <p>
                Regards,<br><br>
                <strong>Accounts Receivable Team</strong><br>
                TYLT Mobility Pvt. Ltd.
            </p>

        </div>
        `

    };

}

module.exports = getEmailTemplate;