const express = require("express");

const router = express.Router();

const outstandingController = require("../controllers/outstandingController");

router.get("/", outstandingController.getOutstanding);

module.exports = router;