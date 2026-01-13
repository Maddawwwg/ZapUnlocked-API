const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");

/**
 * Envia mensagem de texto via WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendMessage(req, res) {
    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: "phone e message obrigatórios" });
    }

    try {
        const jid = `${phone}@s.whatsapp.net`;
        await whatsappService.sendMessage(jid, message);

        res.json({ success: true, message: "Mensagem enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendMessage;
