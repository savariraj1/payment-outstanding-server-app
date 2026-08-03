const nodemailer = require("nodemailer");

console.log("EMAIL :", process.env.GMAIL_USER);
console.log(
    "PASSWORD EXISTS :",
    !!process.env.GMAIL_APP_PASSWORD
);

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },

    logger: true,
    debug: true

});

(async () => {

    try {

        console.log("Verifying Gmail SMTP...");

        await transporter.verify();

        console.log("✅ SMTP VERIFIED");

    } catch (err) {

        console.error("❌ SMTP VERIFY FAILED");
        console.error(err);

    }

})();

module.exports = transporter;