const bcrypt = require("bcrypt");
const db = require("../config/db");

const DEFAULT_USER = {
    fullName: "admin",
    email: "admin@tylt.co.in",
    password: "Admin@123"
};

async function seedDefaultUser() {
    const [rows] = await db.execute(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [DEFAULT_USER.email]
    );

    if (rows.length > 0) {
        console.log("[DB] Default admin already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_USER.password, 10);

    await db.execute(
        `
        INSERT INTO users
        (
            full_name,
            email,
            password,
            status
        )
        VALUES (?, ?, ?, 'Active')
        `,
        [
            DEFAULT_USER.fullName,
            DEFAULT_USER.email,
            hashedPassword
        ]
    );

    console.log("[DB] Default admin user created");
}

module.exports = seedDefaultUser;
