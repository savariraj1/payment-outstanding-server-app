require("dotenv").config();

const nodemailer = require("nodemailer");

async function sendTestMail() {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        await transporter.verify();

        console.log("✅ Gmail Connected Successfully");

        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: "Payment Outstanding System Test",
            html: "<h2>Congratulations!</h2><p>Your Gmail integration is working.</p>"
        });

        console.log("✅ Email Sent");
        console.log(info.messageId);

    } catch (err) {
        console.error(err);
    }
}

sendTestMail();