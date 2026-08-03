const dns = require("dns");
const nodemailer = require("nodemailer");

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "142.250.142.109", // IPv4 address from your DNS lookup
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
        servername: "smtp.gmail.com"
    },
    connectionTimeout: 30000
});

transporter.verify((err) => {
    console.log(err || "SMTP OK");
});

module.exports = transporter;