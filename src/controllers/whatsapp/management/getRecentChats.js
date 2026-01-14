const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");

/**
 * Retorna a lista de chats recentes da sessão
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function getRecentChats(req, res) {
    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    const limit = parseInt(req.body.limit) || 20;

    try {
        const chats = whatsappService.getRecentChats(limit);

        res.json({
            success: true,
            requested: limit,
            found: chats.length,
            chats
        });
    } catch (err) {
        logger.error("❌ Erro ao obter chats recentes:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = getRecentChats;
