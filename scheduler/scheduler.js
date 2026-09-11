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


// ============================================================
// DAILY REPORT
// Monday - Saturday 9 AM
// ============================================================

cron.schedule("0 9 * * 1-6", async () => {

    console.log("=================================");
    console.log("Running Daily Scheduler");
    console.log("=================================");

    // Daily report always runs Monday-Saturday
    await sendDailyReport();

}, {
    timezone: "Asia/Kolkata"
});


// ============================================================
// REGULAR REMINDERS
//
// Tuesday, Thursday, Friday, Saturday
//
// 0-30 is excluded here.
// 31-60 / 61-90 / 90+ continue as normal.
// ============================================================

cron.schedule("30 16 * * 2,4-6", async () => {

    console.log("=================================");
    console.log("Running Regular Reminder Scheduler");
    console.log("=================================");

    // Monthly day should take priority
    if (isMonthlyReminderDay()) {

        console.log(
            "Regular Reminder Skipped (Monthly Reminder Day)"
        );

        return;
    }

    await sendAutomaticReminders({
        includeZeroTo30: false
    });

}, {
    timezone: "Asia/Kolkata"
});


// ============================================================
// MONDAY
//
// Monday 10 AM
//
// 0-30 + 31-60 + 61-90 + 90+
// ============================================================

cron.schedule("0 10 * * 1", async () => {

    console.log("=================================");
    console.log("Running Monday Reminder Scheduler");
    console.log("=================================");

    // Monthly reminder will handle the other ageing buckets
    // separately if Monday is the monthly reminder day.
    if (isMonthlyReminderDay()) {

        console.log(
            "Monday Reminder Skipped (Monthly Reminder Day)"
        );

        return;
    }

    await sendAutomaticReminders({
        includeZeroTo30: true
    });

}, {
    timezone: "Asia/Kolkata"
});


// ============================================================
// WEDNESDAY
//
// Wednesday 9 AM
//
// 0-30 + 31-60 + 61-90 + 90+
// ============================================================

cron.schedule("0 9 * * 3", async () => {

    console.log("=================================");
    console.log("Running Wednesday Reminder Scheduler");
    console.log("=================================");

    // Monthly reminder should take priority
    if (isMonthlyReminderDay()) {

        console.log(
            "Wednesday Reminder Skipped (Monthly Reminder Day)"
        );

        return;
    }

    await sendAutomaticReminders({
        includeZeroTo30: true
    });

}, {
    timezone: "Asia/Kolkata"
});


// ============================================================
// MONTHLY
//
// 1st OR 2nd if 1st is Sunday
//
// Only >30 ageing reminders.
// 0-30 remains strictly Monday + Wednesday.
// ============================================================

cron.schedule("0 11 1,2 * *", async () => {

    if (!isMonthlyReminderDay()) {

        console.log("Monthly Scheduler Skipped");

        return;
    }

    console.log("=================================");
    console.log("Running Monthly Scheduler");
    console.log("=================================");

    await sendAutomaticReminders({
        includeZeroTo30: false
    });

}, {
    timezone: "Asia/Kolkata"
});


console.log("=================================");
console.log("Scheduler Started Successfully");
console.log("Daily Report     : Monday-Saturday 09:00 AM");
console.log("0-30 Reminder    : Monday + Wednesday");
console.log("Other Reminders  : Tuesday, Thursday-Saturday");
console.log("Monday Reminder  : 10:00 AM");
console.log("Monthly Reminder : 1st / 2nd if Sunday");
console.log("=================================");