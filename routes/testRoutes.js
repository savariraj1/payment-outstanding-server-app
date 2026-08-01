const express = require("express");
const router = express.Router();

const { getInvoices } = require("../services/sheetService");

router.get("/sheet", async (req, res) => {

    try {

        const invoices = await getInvoices();

        res.json({
            success: true,
            count: invoices.length,
            data: invoices
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;