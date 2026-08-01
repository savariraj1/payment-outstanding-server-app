// const transporter = require("./gmail");
// const getEmailTemplate = require("../templates/emailTemplates");

// async function sendReminder(customerName, invoices, email) {

//     const template = getEmailTemplate(customerName, invoices);

//     // Default CC list
//     let ccList = process.env.EMAIL_CC || "";

//     // Check if any invoice is more than 60 days overdue
//     const hasMoreThan60 = invoices.some(inv => {

//         const outstanding = Number(inv.outstanding || 0);

//         return (
//             outstanding > 0 &&
//             (
//                 inv.ageingBucket === "61-90" ||
//                 inv.ageingBucket === "90+"
//             )
//         );

//     });

//     // Add escalation CC if needed
//     if (hasMoreThan60 && process.env.EMAIL_ESCALATION_CC) {

//         ccList = ccList
//             ? `${ccList},${process.env.EMAIL_ESCALATION_CC}`
//             : process.env.EMAIL_ESCALATION_CC;

//     }

//     await transporter.sendMail({

//         from: process.env.GMAIL_USER,

//         to: email,

//         cc: ccList,

//         subject: template.subject,

//         html: template.html

//     });

// }

// module.exports = {
//     sendReminder
// };

const transporter = require("./gmail");
const getEmailTemplate = require("../templates/emailTemplates");

async function sendReminder(customerName, invoices, email) {

    const template = getEmailTemplate(customerName, invoices);

    // Default CC list
    let ccList = process.env.EMAIL_CC || "";

    // Check if any invoice is more than 60 days overdue
    const hasMoreThan60 = invoices.some(inv => {

        const outstanding = Number(inv.outstanding || 0);

        return (
            outstanding > 0 &&
            (
                inv.ageingBucket === "61-90" ||
                inv.ageingBucket === "90+"
            )
        );

    });

    // Add escalation CC if needed
    if (hasMoreThan60 && process.env.EMAIL_ESCALATION_CC) {

        ccList = ccList
            ? `${ccList},${process.env.EMAIL_ESCALATION_CC}`
            : process.env.EMAIL_ESCALATION_CC;

    }

    let emailList = [];

    if (Array.isArray(email)) {
        emailList = email;
    } else {
        emailList = (email || "")
            .split(/[;,]/)
            .map(e => e.trim())
            .filter(Boolean);
    }

    // Send email
    const info = await transporter.sendMail({

        from: process.env.GMAIL_USER,

        to: emailList,

        cc: ccList,

        subject: template.subject,

        html: template.html

    });

    // IMPORTANT: return the sendMail response
    return info;
}

module.exports = {
    sendReminder
};