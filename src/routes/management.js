const express = require("express");
const router = express.Router();
const fetchMessages = require("../controllers/whatsapp/management/fetchMessages");
const getRecentChats = require("../controllers/whatsapp/management/getRecentChats");
const { apiKeyAuth } = require("../middleware/auth");

// Todas as rotas de gerenciamento requerem API KEY
router.use(apiKeyAuth);

router.post("/fetch_messages", fetchMessages);
router.post("/recent_contacts", getRecentChats);

module.exports = router;
