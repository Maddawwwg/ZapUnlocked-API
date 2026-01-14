const express = require("express");
const router = express.Router();
const getStatus = require("../controllers/status/getStatus");

const apiKeyMiddleware = require("../middlewares/apiKeyMiddleware");

/**
 * Rotas principais
 */

// GET / - Status da API
// router.get("/", getStatus);

// GET /status - Endpoint específico para o frontend (Protegido)
router.get("/status", apiKeyMiddleware, getStatus);

module.exports = router;
