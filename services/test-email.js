require("dotenv").config();

console.log("Gmail User:", process.env.GMAIL_USER);
console.log("Password Exists:", !!process.env.GMAIL_APP_PASSWORD);

const { sendEmail } = require("./services/emailService");


sendEmail(
    "your-test-email@gmail.com",
    "Payment Follow-up Test",
    "<h3>Email Working Successfully</h3>"
)
.then(() => {
    console.log("Test email completed");
})
.catch((error) => {
    console.log("Error:");
    console.log(error.message);
});