const express = require("express");
const router = express.Router();
const {authenticateToken,authorizeRoles} = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController");

router.get("/", dashboardController.getDashboard);


module.exports = router;