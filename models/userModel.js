const db = require("../config/db");

async function findActiveByEmail(email) {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM users
        WHERE email = ?
          AND status = 'Active'
        LIMIT 1
        `,
        [email]
    );

    return rows[0] || null;

}

module.exports = {
    findActiveByEmail
};
