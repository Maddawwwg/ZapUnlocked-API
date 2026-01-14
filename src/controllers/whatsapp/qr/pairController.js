const { getSock } = require("../../../services/whatsapp/client");
const logger = require("../../../utils/logger");

/**
 * Solicita código de pareamento (Pairing Code)
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function pairDevice(req, res) {
    try {
        const sock = getSock();
        if (!sock) {
            return res.status(503).json({ error: "Serviço WhatsApp não inicializado" });
        }

        if (sock.authState.creds.registered) {
            return res.status(400).json({ error: "WhatsApp já está conectado e registrado." });
        }

        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ error: "Número de telefone obrigatório (ex: 5511999999999)" });
        }

        // Limpa formatação (mantém apenas números)
        const cleanPhone = phone.replace(/[^0-9]/g, "");

        logger.log(`🔗 Solicitando código de pareamento para: ${cleanPhone}`);

        // Solicita o código ao Baileys
        const code = await sock.requestPairingCode(cleanPhone);

        // Formata o código para melhor visualização (ex: ABC-1234)
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

        logger.log(`🔑 Código gerado: ${formattedCode}`);

        res.json({
            success: true,
            code: formattedCode
        });

    } catch (err) {
        logger.error("Erro ao solicitar pairing code", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = pairDevice;
