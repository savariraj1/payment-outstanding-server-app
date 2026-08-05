// // routes/testMailRoute.js

// const express = require("express");
// const { Resend } = require("resend");

// const router = express.Router();

// const resend = new Resend(process.env.RESEND_API_KEY);

// router.get("/", async (req, res) => {

//     try {

//         const { data, error } = await resend.emails.send({

//             from: "Accounts <accounts@tylt.co.in>",
//             to: [process.env.GMAIL_USER],
//             subject: "Railway Test",
//             html: "<h2>Hello from Resend</h2>"

//         });

//         if (error) {
//             return res.status(500).json(error);
//         }

//         console.log(data);

//         res.json(data);

//     } catch (err) {

//         console.error(err);

//         res.status(500).json(err);

//     }

// });

// module.exports = router;


const express = require("express");
const brevo = require("../services/gmail");

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const sendSmtpEmail = {

            sender: {
                name: "Accounts",
                email: "accounts@tylt.co.in"
            },

            to: [
                {
                    email: process.env.GMAIL_USER
                }
            ],

            subject: "Brevo Test",

            htmlContent: "<h2>Hello From Brevo</h2>"

        };

        const result = await brevo.sendTransacEmail(sendSmtpEmail);

        res.json(result);

    } catch (err) {

        console.error(err);

        res.status(500).json(err);

    }

});

module.exports = router;