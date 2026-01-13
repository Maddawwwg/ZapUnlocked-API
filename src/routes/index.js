const express = require("express");
const router = express.Router();
const getStatus = require("../controllers/status/getStatus");

/**
 * Rotas principais
 */

// GET / - Status da API
router.get("/", getStatus);

module.exports = router;
