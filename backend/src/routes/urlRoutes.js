const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

router.post("/shorten", urlController.shortenUrl);

module.exports = router;