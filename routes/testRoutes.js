// routes/testMailRoute.js

const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const transporter = nodemailer.createTransport({

            service: "gmail",

            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }

        });

        console.log("Verifying...");

        await transporter.verify();

        console.log("Verified");

        const info = await transporter.sendMail({

            from: process.env.GMAIL_USER,

            to: process.env.GMAIL_USER,

            subject: "Railway Test",

            text: "Hello"

        });

        console.log(info);

        res.json(info);

    }
    catch(err){

        console.error(err);

        res.status(500).json({
            message: err.message,
            code: err.code,
            command: err.command
        });

    }

});

module.exports = router;