const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/login", (req, res, next) => {
    console.log("Reached /api/auth/login");
    next();
}, authController.login);

module.exports = router;