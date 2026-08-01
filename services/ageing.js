function calculateAgeing(dueDate) {

    if (!dueDate) {
        return {
            days: 0,
            bucket: "0-30"
        };
    }

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
        (today.getTime() - due.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const days = Math.max(diffDays, 0);

    let bucket;

    if (days <= 30) {
        bucket = "0-30";
    }
    else if (days <= 60) {
        bucket = "31-60";
    }
    else if (days <= 90) {
        bucket = "61-90";
    }
    else {
        bucket = "90+";
    }

    return {
        days,
        bucket
    };
}

module.exports = calculateAgeing;