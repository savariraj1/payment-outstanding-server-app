const express = require("express");
const router = express.Router();
const responseCache = require("../middleware/responseCache");
const {authenticateToken,authorizeRoles} = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController");

router.get("/", responseCache(), dashboardController.getDashboard);


module.exports = router;