function isToday(dateString) {

    if (!dateString) return false;

    const reminderDate = new Date(dateString);
    const today = new Date();

    return (
        reminderDate.getDate() === today.getDate() &&
        reminderDate.getMonth() === today.getMonth() &&
        reminderDate.getFullYear() === today.getFullYear()
    );
}

module.exports = {
    isToday
};