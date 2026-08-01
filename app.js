// const express = require("express");
// const cors = require("cors");
// const testRoutes = require("./routes/testRoutes");
// const outstandingRoutes = require("./routes/outstandingRoutes");
// const emailRoutes = require("./routes/emailRoutes");
// const sheetService = require("./services/sheetService");
// const dashboardRoutes = require("./routes/dashboardRoutes");
// const path = require("path");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/api", testRoutes);
// app.use("/api/outstanding", outstandingRoutes);
// app.use("/api/email", emailRoutes);
// app.use("/api/dashboard", dashboardRoutes);


// // Health Check
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/index.html"));
//         success: true,
//         application: "Payment Outstanding Follow-up System",
//         version: "1.0.0",
//         status: "Running"
//     });

// // Future API Routes
// // app.use("/api/outstanding", require("./routes/outstandingRoutes"));

// // 404 Handler
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: "Route not found"
//     });
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//     console.error(err);

//     res.status(500).json({
//         success: false,
//         message: err.message || "Internal Server Error"
//     });
// });

// // app.get("/test-update", async (req, res) => {
// //     try {
// //         await sheetService.updateLastReminder(2);

// //         res.json({
// //             success: true,
// //             message: "Updated Row 2"
// //         });

// //     } catch (err) {
// //         res.json({
// //             success: false,
// //             error: err.message
// //         });
// //     }
// // });

// // Test Route
// app.get("/test-update", async (req, res) => {
//     try {
//         await sheetService.updateLastReminder(2);

//         res.json({
//             success: true,
//             message: "Updated Row 2"
//         });

//     } catch (err) {
//         res.json({
//             success: false,
//             error: err.message
//         });
//     }
// });

// // 404 Handler
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: "Route not found"
//     });
// });

// // async function updateLastReminder(rowNumber) {

// //     console.log("Updating row:", rowNumber);

// //     const now = new Date().toISOString();

// //     await sheets.spreadsheets.values.update({

// //         spreadsheetId,

// //         range: `Invoices!I${rowNumber}:J${rowNumber}`,

// //         valueInputOption: "RAW",

// //         requestBody: {
// //             values: [[now, "Reminder Sent"]]
// //         }

// //     });

// //     console.log("Updated Successfully");

// // }

// module.exports = app;


const express = require("express");
const cors = require("cors");
const path = require("path");

const testRoutes = require("./routes/testRoutes");
const outstandingRoutes = require("./routes/outstandingRoutes");
const emailRoutes = require("./routes/emailRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
// const sheetService = require("./services/sheetService");
const exportRoutes = require("./routes/exportRoutes");
const authRoutes = require("./routes/authRoutes");
const importRoutes = require("./routes/importRoutes");



const app = express();
app.use((req, res, next) => {
    console.log(">>>>", req.method, req.url);
    next();
});

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log("Incoming:", req.method, req.url);
    next();
});


// Serve Frontend
app.use(
    express.static(
        path.join(__dirname, "../Payment-Outstanding-system/client")
    )
);

// ======================
// API Routes
// ======================
app.use("/api", testRoutes);
app.use("/api/outstanding", outstandingRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/import", importRoutes);

// ======================
// Home Page
// ======================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../Payment-Outstanding-system/client/index.html"
        )
    );

});

app.use(
    express.static(
        path.join(
            __dirname,
            "../Payment-Outstanding-system/client"
        )
    )
);

// ======================
// Test Update Route
// ======================
// app.get("/test-update", async (req, res) => {
//     try {

//         await sheetService.updateLastReminder(2);

//         res.json({
//             success: true,
//             message: "Updated Row 2"
//         });

//     } catch (err) {

//         res.status(500).json({
//             success: false,
//             message: err.message
//         });

//     }
// });

// ======================
// 404 Handler
// ======================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ======================
// Error Handler
// ======================
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

});
console.log("App initialized");
module.exports = app;