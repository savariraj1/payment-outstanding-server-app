require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestMail() {
    try {

        const { data, error } = await resend.emails.send({

            from: "Accounts <accounts@tylt.co.in>",

            to: [process.env.GMAIL_USER],

            subject: "Payment Outstanding System Test",

            html: "<h2>Congratulations!</h2><p>Your Resend integration is working.</p>"

        });

        if (error) {
            console.error(error);
            return;
        }

        console.log("✅ Email Sent");
        console.log(data);

    } catch (err) {
        console.error(err);
    }
}

sendTestMail();