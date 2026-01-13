const { downloadMediaMessage } = require("@itsukichan/baileys");
const logger = require("./logger");

/**
 * Utilitários para download e processamento de mídia
 */

/**
 * Baixa uma mensagem de mídia
 * @param {Object} sock - Socket do WhatsApp
 * @param {Object} msg - Mensagem contendo mídia (formato completo do Baileys)
 * @returns {Promise<Buffer>} - Buffer da mídia
 */
async function downloadMedia(sock, msg) {
  try {
    const buffer = await downloadMediaMessage(
      msg,
      "buffer",
      {},
      { 
        logger, 
        reuploadRequest: sock.updateMediaMessage 
      }
    );
    return buffer;
  } catch (error) {
    logger.error("❌ Erro ao baixar mídia:", error.message);
    throw error;
  }
}

/**
 * Baixa mídia de uma mensagem citada
 * @param {Object} sock - Socket do WhatsApp
 * @param {Object} quotedMsg - Mensagem citada completa (com estrutura do Baileys)
 * @returns {Promise<Buffer>} - Buffer da mídia
 */
async function downloadQuotedMedia(sock, quotedMsg) {
  try {
    // A mensagem citada já vem no formato correto do Baileys
    // Precisamos apenas reconstruir a estrutura esperada
    const buffer = await downloadMediaMessage(
      { message: quotedMsg },
      "buffer",
      {},
      { 
        logger, 
        reuploadRequest: sock.updateMediaMessage 
      }
    );
    return buffer;
  } catch (error) {
    logger.error("❌ Erro ao baixar mídia citada:", error.message);
    throw error;
  }
}

module.exports = {
  downloadMedia,
  downloadQuotedMedia
};
