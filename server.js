    // require("dotenv").config();

    // const app = require("./app");

    // const startScheduler = require("./cron/scheduler");

    // const PORT = process.env.PORT || 5000;

    // app.listen(PORT, () => {

    //     console.log(`Server Running on ${PORT}`);

    //     startScheduler();

    // });

    
    require("dotenv").config();
    
    // console.log("DB_HOST:", process.env.DB_HOST);
    // console.log("DB_USER:", process.env.DB_USER);
    // console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
    // console.log("DB_NAME:", process.env.DB_NAME);

    const app = require("./app");

// ===========================
// Start Scheduler
// ===========================
require("./scheduler/scheduler");

const PORT = process.env.PORT || 5000;

console.log("================================");
console.log("SERVER STARTING...");
console.log("================================");

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});