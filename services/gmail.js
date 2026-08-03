const dns = require("dns");
const nodemailer = require("nodemailer");

// Force Node.js to prefer IPv4 over IPv6
dns.setDefaultResultOrder("ipv4first");

// Check DNS resolution
dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
    if (err) {
        console.log("DNS Lookup Error:", err);
    } else {
        console.log("SMTP Addresses:", addresses);
    }
});

console.log("EMAIL :", process.env.GMAIL_USER);
console.log("PASSWORD EXISTS :", !!process.env.GMAIL_APP_PASSWORD);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP Verify Error:");
        console.log(error);
    } else {
        console.log("SMTP Server is ready");
    }
});

module.exports = transporter;