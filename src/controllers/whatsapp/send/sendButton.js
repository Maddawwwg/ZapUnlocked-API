const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");
const { createCallbackPayload } = require("../../../utils/callbackUtils");

/**
 * Envia mensagem com botão customizado via WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendWithButtons(req, res) {
    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    const { phone, message, button_text, webhook, reaction, quoted_id } = req.body;

    if (!phone || !message || !button_text) {
        return res.status(400).json({ error: "phone, message e button_text obrigatórios" });
    }

    try {
        let buttonId = "reply_button"; // ID padrão

        // Se houver configuração de webhook ou reação, gera o callback e usa como ID
        if ((webhook && (webhook.url || webhook.reaction)) || reaction) {
            const token = createCallbackPayload({
                ...(webhook || {}),
                reaction: reaction || (webhook && webhook.reaction) || null
            });
            buttonId = `cb=${token}`;
        }

        const jid = `${phone}@s.whatsapp.net`;
        const options = {};

        // Se houver quoted_id, tenta recuperar a mensagem do store
        if (quoted_id) {
            const store = whatsappService.getStore();
            const quotedMsg = await store.loadMessage(jid, quoted_id);
            if (quotedMsg) {
                options.quoted = quotedMsg;
            } else {
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

        await whatsappService.sendButtonMessage(jid, message, button_text, buttonId, options);

        res.json({ success: true, message: "Mensagem com botão enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar com botão:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendWithButtons;
