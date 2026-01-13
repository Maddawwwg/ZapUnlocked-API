const { downloadMedia, downloadQuotedMedia } = require("../utils/mediaUtils");
const logger = require("../utils/logger");

/**
 * Handler para criar figurinha a partir de imagem
 * @param {Object} sock - Socket do WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {Object} msg - Mensagem original
 * @param {Object} imageMessage - Objeto de imagem
 * @param {boolean} isQuoted - Se é uma imagem citada
 */
async function createStickerFromImage(sock, jid, msg, imageMessage, isQuoted = false) {
  try {
    logger.log(`🎨 Criando figurinha de imagem ${isQuoted ? 'citada' : 'com .f'}`);
    
    let buffer;
    if (isQuoted) {
      // Quando é citada, precisamos reconstruir a mensagem no formato do Baileys
      const quotedMsg = { imageMessage: imageMessage };
      buffer = await downloadQuotedMedia(sock, quotedMsg);
    } else {
      // Quando é a mensagem atual, usa direto
      buffer = await downloadMedia(sock, msg);
    }

    await sock.sendMessage(jid, {
      sticker: buffer,
      mimetype: imageMessage.mimetype || "image/jpeg"
    }, { quoted: msg });
    
    logger.log("✅ Figurinha criada e enviada");
  } catch (error) {
    logger.error("❌ Erro ao criar figurinha:", error.message);
    await sock.sendMessage(jid, {
      text: "❌ Erro ao criar figurinha",
      contextInfo: { quotedMessage: msg.message }
    });
  }
}

/**
 * Handler para converter figurinha em foto
 * @param {Object} sock - Socket do WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {Object} msg - Mensagem original
 * @param {Object} stickerMessage - Objeto de figurinha
 */
async function convertStickerToImage(sock, jid, msg, stickerMessage) {
  try {
    logger.log("📷 Convertendo figurinha em foto com .t");
    
    // Reconstroi a mensagem no formato do Baileys
    const quotedMsg = { stickerMessage: stickerMessage };
    const buffer = await downloadQuotedMedia(sock, quotedMsg);

    await sock.sendMessage(jid, {
      image: buffer,
      mimetype: stickerMessage.mimetype || "image/webp"
    }, { quoted: msg });
    
    logger.log("✅ Figurinha convertida em foto e enviada");
  } catch (error) {
    logger.error("❌ Erro ao converter figurinha:", error.message);
    await sock.sendMessage(jid, {
      text: "❌ Erro ao converter figurinha em foto",
      contextInfo: { quotedMessage: msg.message }
    });
  }
}

module.exports = {
  createStickerFromImage,
  convertStickerToImage
};
