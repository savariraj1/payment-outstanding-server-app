// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_APP_PASSWORD
//     }
// });

// transporter.verify((err) => {
//     if (err) {
//         console.log("SMTP ERROR");
//         console.log(err);
//     } else {
//         console.log("SMTP READY");
//     }
// });

// module.exports = transporter;

const SibApiV3Sdk = require("@getbrevo/brevo");

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SENDINBLUE_KEY
);

module.exports = apiInstance;