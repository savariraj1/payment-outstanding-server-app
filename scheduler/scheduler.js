const cron = require("node-cron");

const {
    sendAutomaticReminders
} = require("../services/reminderService");

const {
sendDailyReport
}=require("../services/dailyReportService");

// =====================================
// DAILY
// Runs every day at 9:00 AM
// =====================================

cron.schedule("0 9 * * *", async () => {

    console.log("=================================");
    console.log("Running Daily Scheduler");
    console.log("=================================");

    await sendAutomaticReminders();

    await sendDailyReport();

});

// =====================================
// WEEKLY
// Every Monday at 10:00 AM
// =====================================

cron.schedule("0 10 * * 1", async () => {

    console.log("=================================");
    console.log("Running Weekly Scheduler");
    console.log("=================================");

    await sendAutomaticReminders();

});

// =====================================
// MONTHLY
// First day of every month at 11:00 AM
// =====================================

cron.schedule("0 11 1 * *", async () => {

    console.log("=================================");
    console.log("Running Monthly Scheduler");
    console.log("=================================");

    await sendAutomaticReminders();

});

console.log("=================================");
console.log("Scheduler Started Successfully");
console.log("Daily   : 09:00 AM");
console.log("Weekly  : Monday 10:00 AM");
console.log("Monthly : 1st Day 11:00 AM");
console.log("=================================");