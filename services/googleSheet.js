// const { google } = require("googleapis");
// const path = require("path");


// const auth = new google.auth.GoogleAuth({
//     keyFile: path.join(
//         __dirname,
//         "../../Payment-Outstanding-system/credentials/service-account.json"
//     ),
//     scopes: [
//         "https://www.googleapis.com/auth/spreadsheets"
//     ]
// });

// const sheets = google.sheets({
//     version: "v4",
//     auth
// });

// const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// console.log("Spreadsheet ID:", spreadsheetId);

// module.exports = {
//     sheets,
//     spreadsheetId
// };

const { google } = require("googleapis");
const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../../.env")
});

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(
        __dirname,
        "../../Payment-Outstanding-system/credentials/service-account.json"
    ),
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
    ]
});

const sheets = google.sheets({
    version: "v4",
    auth
});

// const spreadsheetId = process.env.GOOGLE_SHEET_ID;

console.log("=================================");
// console.log("Spreadsheet ID:", spreadsheetId);
console.log("=================================");

module.exports = {
    sheets,
    // spreadsheetId
};