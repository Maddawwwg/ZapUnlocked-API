const sessionService = require("../../../services/sessionService");
const logger = require("../../../utils/logger");

/**
 * Faz logout (apaga sessão)
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function logout(req, res) {
    try {
        const result = await sessionService.clearSession();
        res.json(result);
    } catch (error) {
        logger.error("❌ Erro ao apagar sessão:", error.message);
        res.status(500).json({
            error: "Erro ao apagar sessão",
            message: error.message
        });
    }
}

module.exports = logout;
