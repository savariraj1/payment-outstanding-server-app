const express = require("express");

const router = express.Router();

const outstandingController = require("../controllers/outstandingController");
const responseCache = require("../middleware/responseCache");

router.get("/", responseCache(), outstandingController.getOutstanding);

module.exports = router;