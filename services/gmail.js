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
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    // Connection timeout settings (ms) - configurable via env vars
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT) || 30000,
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT) || 30000,
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT) || 30000,
    requireTLS: true,
    // Use pooling to reduce connection churn when sending many messages
    pool: process.env.EMAIL_POOL === "true" || false,
    maxConnections: Number(process.env.EMAIL_MAX_CONNECTIONS) || 5,
    maxMessages: Number(process.env.EMAIL_MAX_MESSAGES) || 100
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP Verify Error:");
        console.log(error);
    } else {
        console.log("SMTP Server is ready");
    }
});

// Helper: exponential backoff sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Monkey-patch sendMail to add retry logic for transient network errors
const originalSendMail = transporter.sendMail.bind(transporter);
transporter.sendMail = async (mailOptions) => {
    const maxRetries = Number(process.env.EMAIL_MAX_RETRIES) || 3;
    const baseDelay = Number(process.env.EMAIL_RETRY_BASE_DELAY) || 2000; // ms

    let attempt = 0;
    while (true) {
        try {
            attempt++;
            if (attempt > 1) console.log(`sendMail attempt ${attempt}...`);
            const info = await originalSendMail(mailOptions);
            return info;
        } catch (err) {
            const isTransient = err && err.code && [
                'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ENOTFOUND', 'ECONNREFUSED'
            ].includes(err.code);

            console.log(`sendMail error (attempt ${attempt}):`, err && err.code ? err.code : err);

            if (!isTransient || attempt >= maxRetries) {
                // Non-retryable or out of attempts
                throw err;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Transient error detected, retrying after ${delay}ms`);
            await sleep(delay);
            // loop to retry
        }
    }
};

module.exports = transporter;