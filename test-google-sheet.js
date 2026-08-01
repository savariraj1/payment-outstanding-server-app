require("dotenv").config();

const { google } = require("googleapis");

async function testSheet(){

    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes:[
            "https://www.googleapis.com/auth/spreadsheets"
        ]
    });

    const client = await auth.getClient();

    const sheets = google.sheets({
        version:"v4",
        auth:client
    });


    const result = await sheets.spreadsheets.values.get({
        spreadsheetId:process.env.GOOGLE_SHEET_ID,
        range:"Sheet1!A1:D5"
    });


    console.log(result.data.values);

}

testSheet();