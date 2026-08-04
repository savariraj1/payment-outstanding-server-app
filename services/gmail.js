// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_APP_PASSWORD
//     }
// });

// transporter.verify((err) => {
//     if (err) {
//         console.log("SMTP ERROR");
//         console.log(err);
//     } else {
//         console.log("SMTP READY");
//     }
// });

// module.exports = transporter;

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;