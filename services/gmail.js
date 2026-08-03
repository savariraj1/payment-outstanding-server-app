const dns = require("dns");
const nodemailer = require("nodemailer");

// Force global Node.js DNS to prioritize IPv4
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4, // <-- CRITICAL: Forces Nodemailer socket to use IPv4 only
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP Verify Error:", error);
    } else {
        console.log("SMTP Server is ready");
    }
});

module.exports = transporter;