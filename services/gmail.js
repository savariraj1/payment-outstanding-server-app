const nodemailer = require("nodemailer");

console.log("EMAIL :", process.env.GMAIL_USER);
console.log(
    "PASSWORD EXISTS :",
    !!process.env.GMAIL_APP_PASSWORD
);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP Verify Error:");
        console.log(error);
    } else {
        console.log("SMTP Server is ready");
    }
});

module.exports = transporter;