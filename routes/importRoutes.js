const express = require("express");

const multer = require("multer");

const controller = require("../controllers/importController");

const upload = multer({
    dest:"uploads/"
});

const router = express.Router();

router.post(
    "/",
    upload.single("file"),
    controller.importExcel
);

module.exports = router;