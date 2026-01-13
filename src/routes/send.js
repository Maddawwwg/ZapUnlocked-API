const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const sendMessage = require("../controllers/whatsapp/send/sendMessage");
const sendButton = require("../controllers/whatsapp/send/sendButton");

/**
 * Rotas para envio de mensagens
 */

// POST /send - Enviar mensagem via WhatsApp
router.post("/send", auth, sendMessage);

// POST /send_wbuttons - Enviar mensagem com botões via WhatsApp
router.post("/send_wbuttons", auth, sendButton);

module.exports = router;
