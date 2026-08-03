const cron = require("node-cron");

const {
    sendAutomaticReminders
} = require("../services/reminderService");

const {
    sendDailyReport
} = require("../services/dailyReportService");

// ===============================
// Helper Functions
// ===============================

function isMonthlyReminderDay(date = new Date()) {

    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay(); // Sunday = 0

    return (
        (dayOfMonth === 1 && dayOfWeek !== 0) ||
        (dayOfMonth === 2 && dayOfWeek === 1)
    );
}

function isWeeklyReminderDay(date = new Date()) {

    // Monday
    return date.getDay() === 1;
}

// =====================================
// DAILY
// Monday - Saturday 9 AM
// =====================================

cron.schedule("0 9 * * 1-6", async () => {

    console.log("=================================");
    console.log("Running Daily Scheduler");
    console.log("=================================");

    // Daily Report should ALWAYS go (except Sunday)
    await sendDailyReport();

    // Skip reminder if today is Monthly day
    if (isMonthlyReminderDay()) {

        console.log("Daily Reminder Skipped (Monthly Reminder Day)");
        return;
    }

    // Skip reminder if today is Weekly day
    if (isWeeklyReminderDay()) {

        console.log("Daily Reminder Skipped (Weekly Reminder Day)");
        return;
    }

    await sendAutomaticReminders();

},
{
    timezone: "Asia/Kolkata"
}
);

// =====================================
// WEEKLY
// Every Monday 10 AM
// =====================================

cron.schedule("0 10 * * 1", async () => {

    console.log("=================================");
    console.log("Running Weekly Scheduler");
    console.log("=================================");

    // Skip if Monthly reminder should run
    if (isMonthlyReminderDay()) {

        console.log("Weekly Reminder Skipped (Monthly Reminder Day)");
        return;
    }

    await sendAutomaticReminders();

},
{
    timezone: "Asia/Kolkata"
}
);

// =====================================
// MONTHLY
// 1st OR 2nd (if 1st is Sunday)
// =====================================

cron.schedule("55 16 * * *", async () => {

    // if (!isMonthlyReminderDay()) {

    //     console.log("Monthly Scheduler Skipped");
    //     return;
    // }

    console.log("=================================");
    console.log("Running Monthly Scheduler");
    console.log("=================================");

    await sendAutomaticReminders();

},
{
    timezone: "Asia/Kolkata"
});

console.log("=================================");
console.log("Scheduler Started Successfully");
console.log("Daily   : 09:00 AM");
console.log("Weekly  : Monday 10:00 AM");
console.log("Monthly : 1st (or 2nd if 1st is Sunday)");
console.log("=================================");