const whatsappService = require("../../../services/whatsapp");
const { triggerWebhook } = require("../../../services/webhookService");
const logger = require("../../../utils/logger");

/**
 * Busca histórico de mensagens de um contato
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function fetchMessages(req, res) {
    const { phone, limit, type, webhook } = req.body;

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    if (!phone) {
        return res.status(400).json({ error: "O campo 'phone' é obrigatório" });
    }

    try {
        const jid = `${phone}@s.whatsapp.net`;
        const result = await whatsappService.fetchMessages(jid, parseInt(limit) || 20, type || "all");

        // Se houver webhook
        if (webhook && webhook.url) {
            triggerWebhook(webhook, {
                phone,
                requested: result.requested.toString(),
                found: result.found.toString(),
                text: `Histórico de ${result.found} mensagens obtido.`
            });
        }

        res.json({
            success: true,
            phone,
            ...result
        });
    } catch (err) {
        logger.error(`❌ Erro ao buscar mensagens para ${phone}:`, err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = fetchMessages;
