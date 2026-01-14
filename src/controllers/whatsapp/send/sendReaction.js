const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");

/**
 * Reage a uma mensagem específica via WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendReaction(req, res) {
    const { phone, messageId, emoji } = req.body;

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    if (!phone || !messageId || !emoji) {
        return res.status(400).json({ error: "phone, messageId e emoji são obrigatórios" });
    }

    try {
        const jid = `${phone}@s.whatsapp.net`;
        await whatsappService.sendReaction(jid, messageId, emoji);

        res.json({ success: true, message: "Reação enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar reação:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendReaction;
