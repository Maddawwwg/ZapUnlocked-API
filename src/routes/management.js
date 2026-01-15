const express = require("express");
const router = express.Router();
const fetchMessages = require("../controllers/whatsapp/management/fetchMessages");
const getRecentChats = require("../controllers/whatsapp/management/getRecentChats");
const getVolumeStats = require("../controllers/system/getVolumeStats");
const getMemoryStats = require("../controllers/system/getMemoryStats");
const clearStorage = require("../controllers/system/clearStorage");
const { auth } = require("../middleware/auth");

// Todas as rotas de gerenciamento requerem API KEY
router.use(auth);

router.post("/fetch_messages", (req, res) => require("../controllers/whatsapp/management/fetchMessages")(req, res));
router.post("/recent_contacts", (req, res) => require("../controllers/whatsapp/management/getRecentChats")(req, res));
router.get("/memory", (req, res) => require("../controllers/system/getMemoryStats")(req, res));
router.get("/volume_stats", (req, res) => require("../controllers/system/getVolumeStats")(req, res));
router.delete("/cleanup", (req, res) => require("../controllers/system/clearStorage")(req, res));

module.exports = router;
