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

    const { phone, message, quoted_id } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: "phone e message obrigatórios" });
    }

    try {
        const jid = `${phone}@s.whatsapp.net`;
        const options = {};

        // Se houver quoted_id, tenta recuperar a mensagem do store
        if (quoted_id) {
            const store = whatsappService.getStore();
            const quotedMsg = await store.loadMessage(jid, quoted_id);
            if (quotedMsg) {
                options.quoted = quotedMsg;
            } else {
                // Se não encontrar no cache, cria uma "stub" key para o reply ainda aparecer
                options.quoted = {
                    key: {
                        remoteJid: jid,
                        fromMe: false,
                        id: quoted_id
                    },
                    message: { conversation: "..." }
                };
            }
        }

        await whatsappService.sendMessage(jid, message, options);

        res.json({ success: true, message: "Mensagem enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendMessage;
