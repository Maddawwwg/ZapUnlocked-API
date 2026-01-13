const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");

/**
 * Envia mensagem com botão customizado via WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendWithButtons(req, res) {
    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    const { phone, message, button_text, button_value } = req.body;

    if (!phone || !message || !button_text || !button_value) {
        return res.status(400).json({ error: "phone, message, button_text e button_value obrigatórios" });
    }

    try {
        const jid = `${phone}@s.whatsapp.net`;
        await whatsappService.sendButtonMessage(jid, message, button_text, button_value);

        res.json({ success: true, message: "Mensagem com botão enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar com botão:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendWithButtons;
