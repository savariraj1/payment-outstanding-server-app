const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");
const { authenticateToken } = require("../middleware/auth");

router.put(
    "/:id",
    authenticateToken,
    invoiceController.updateInvoice
);

module.exports = router;