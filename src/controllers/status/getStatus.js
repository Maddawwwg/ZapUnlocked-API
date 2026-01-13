const whatsappService = require("../../services/whatsapp");

/**
 * Retorna o status da API e do WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function getStatus(req, res) {
    res.json({
        status: "online",
        whatsapp: whatsappService.getStatus() ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
    });
}

module.exports = getStatus;
