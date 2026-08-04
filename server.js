    // require("dotenv").config();

    // const app = require("./app");

    // const startScheduler = require("./cron/scheduler");

    // const PORT = process.env.PORT || 5000;

    // app.listen(PORT, () => {

    //     console.log(`Server Running on ${PORT}`);

    //     startScheduler();

    // });
require("dotenv").config();

const app = require("./app");
const initDb = require("./config/initDb");

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
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

startServer();