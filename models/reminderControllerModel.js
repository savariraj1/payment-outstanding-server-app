const db = require("../config/db");


// ============================================================
// GET REMINDER CONTROL FOR ONE COMPANY
// ============================================================

async function getByCompany(companyName) {

    const sql = `
        SELECT
            id,
            company_name,
            paused_until,
            created_at,
            updated_at
        FROM reminder_controls
        WHERE company_name = ?
        LIMIT 1
    `;

    const [rows] = await db.query(
        sql,
        [companyName]
    );

    return rows.length
        ? rows[0]
        : null;
}


// ============================================================
// STOP / UPDATE COMPANY REMINDER
// ============================================================

async function setPausedUntil(companyName, restartDate) {

    if (!companyName) {
        throw new Error("Company name is required");
    }

    if (!restartDate) {
        throw new Error("Restart date is required");
    }

    const sql = `
        INSERT INTO reminder_controls
        (
            company_name,
            paused_until
        )
        VALUES (?, ?)

        ON DUPLICATE KEY UPDATE
            paused_until = VALUES(paused_until)
    `;

    await db.query(
        sql,
        [
            companyName,
            restartDate
        ]
    );

}



// ============================================================
// RESTART COMPANY
// ============================================================

async function clearPause(companyName) {

    const sql = `
        UPDATE reminder_controls
        SET paused_until = NULL
        WHERE company_name = ?
    `;

    await db.query(
        sql,
        [companyName]
    );
}


// ============================================================
// GET ALL STOPPED COMPANIES
// ============================================================

async function getAllPaused() {

    const sql = `
        SELECT
            id,
            company_name,
            paused_until,
            created_at,
            updated_at
        FROM reminder_controls
        WHERE paused_until IS NOT NULL
        ORDER BY paused_until ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
}


module.exports = {

    getByCompany,

    setPausedUntil,

    clearPause,

    getAllPaused

};