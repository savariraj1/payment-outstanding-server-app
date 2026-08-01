const db = require("../config/db");

async function createImportBatch(fileName) {

    const [result] = await db.query(
        `
        INSERT INTO import_history
        (
            file_name,
            total_rows,
            inserted_rows,
            duplicate_rows
        )
        VALUES
        (
            ?, 0, 0, 0
        )
        `,
        [fileName]
    );

    return result;

}

async function updateImportBatch(id, summary) {

    const [result] = await db.query(
        `
        UPDATE import_history
        SET
            total_rows = ?,
            inserted_rows = ?,
            duplicate_rows = ?
        WHERE id = ?
        `,
        [
            summary.totalRows,
            summary.insertedRows,
            summary.duplicateRows,
            id
        ]
    );

    return result;

}

async function findLatest(limit = 2) {

    const [rows] = await db.query(
        `
        SELECT id
        FROM import_history
        ORDER BY id DESC
        LIMIT ?
        `,
        [limit]
    );

    return rows;

}

module.exports = {
    createImportBatch,
    updateImportBatch,
    findLatest
};
