const mysql = require("mysql2/promise");

const databaseUrl = process.env.DATABASE_URL;
let connectionConfig;
let connectionSource;

if (databaseUrl) {

    let parsedUrl;

    try {
        parsedUrl = new URL(databaseUrl);
    }
    catch (error) {
        throw new Error("DATABASE_URL is not a valid URL.");
    }

    if (!parsedUrl.hostname) {
        throw new Error(
            "DATABASE_URL is missing a database host. Remove it to use local DB settings or provide the full DB URL."
        );
    }

    connectionConfig = {
        host: parsedUrl.hostname,
        port: parsedUrl.port ? Number(parsedUrl.port) : 3306,
        user: decodeURIComponent(parsedUrl.username),
        password: decodeURIComponent(parsedUrl.password),
        database: parsedUrl.pathname.replace(/^\//, "")
    };
    connectionSource = "server";

}
else {

    if (
        !process.env.DB_HOST ||
        !process.env.DB_USER ||
        !process.env.DB_NAME
    ) {
        throw new Error(
            "Set DATABASE_URL or provide local DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME values."
        );
    }

    connectionConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME
    };
    connectionSource = "local";

}

const pool = mysql.createPool({
    ...connectionConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log(
    `[DB] Connected with ${connectionSource === "server" ? "prod db" : "local db"}`
);

module.exports = pool;
