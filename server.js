    // require("dotenv").config();

    // const app = require("./app");

    // const startScheduler = require("./cron/scheduler");

    // const PORT = process.env.PORT || 5000;

    // app.listen(PORT, () => {

    //     console.log(`Server Running on ${PORT}`);

    //     startScheduler();

    // });
const net = require("net");

const socket = net.createConnection(
    {
        host: "smtp.gmail.com",
        port: 465
    },
    () => {
        console.log("✅ Connected to Gmail SMTP");
        socket.end();
    }
);

socket.setTimeout(10000);

socket.on("timeout", () => {
    console.log("❌ Connection timed out");
    socket.destroy();
});

socket.on("error", (err) => {
    console.log("❌ Connection error:", err);
});

    
require("dotenv").config();
    
    // console.log("DB_HOST:", process.env.DB_HOST);
    // console.log("DB_USER:", process.env.DB_USER);
    // console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
    // console.log("DB_NAME:", process.env.DB_NAME);

const app = require("./app");
const initDb = require("./config/initDb");

// ===========================
// Start Scheduler
// ===========================
console.log("================================");
console.log("SERVER STARTING...");
console.log("================================");

async function startServer() {
    try {
        await initDb();

        require("./scheduler/scheduler");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server Running on Port ${PORT}`);
        });
    }
    catch (error) {
        console.error("[SERVER] Startup failed");
        console.error(error);
        process.exit(1);
    }
}

startServer();
