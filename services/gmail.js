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

module.exports = transporter;