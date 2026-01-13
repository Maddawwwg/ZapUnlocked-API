/**
 * Utilitário para parsear e extrair informações de mensagens do WhatsApp
 */

/**
 * Extrai informações relevantes de uma mensagem
 * @param {Object} msg - Mensagem do WhatsApp
 * @returns {Object} - Informações parseadas
 */
function parseMessage(msg) {
  if (!msg || !msg.message) {
    return null;
  }

  const jid = msg.key.remoteJidAlt || msg.key.remoteJid;
  const conversationText = msg.message.conversation?.toLowerCase() || "";
  const extendedText = msg.message.extendedTextMessage?.text?.toLowerCase() || "";

  // Captura texto de botões (se for uma resposta de botão)
  const buttonText = msg.message.buttonsResponseMessage?.selectedDisplayText?.toLowerCase() || "";

  // Texto completo: prioriza legenda da imagem, depois botão, depois extendedText, depois conversation
  const fullText = imageCaption || buttonText || extendedText || conversationText;

  // Verifica se há mensagem citada (pode estar em vários lugares)
  // Quando você responde uma mensagem, o Baileys coloca em contextInfo
  const contextInfoExtended = msg.message.extendedTextMessage?.contextInfo;
  const contextInfoImage = msg.message.imageMessage?.contextInfo;
  const contextInfoSticker = msg.message.stickerMessage?.contextInfo;
  const contextInfoConversation = msg.message.conversation ? null : null;

  // Tenta encontrar contextInfo em qualquer lugar
  const contextInfo = contextInfoExtended || contextInfoImage || contextInfoSticker;

  // A mensagem citada pode estar em contextInfo.quotedMessage
  const quotedFromContext = contextInfo?.quotedMessage;

  // Também verifica diretamente (alguns casos podem ter estrutura diferente)
  const quotedFromExtended = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
  const quotedFromImage = msg.message.imageMessage?.contextInfo?.quotedMessage;

  // Prioriza quotedFromContext, depois as outras
  const finalQuotedMessage = quotedFromContext || quotedFromExtended || quotedFromImage;

  return {
    jid,
    phone: jid.split("@")[0],
    text: fullText,
    conversationText,
    imageMessage: msg.message.imageMessage,
    stickerMessage: msg.message.stickerMessage,
    quotedMessage: finalQuotedMessage,
    quotedImage: finalQuotedMessage?.imageMessage,
    quotedSticker: finalQuotedMessage?.stickerMessage,
    buttonResponse: msg.message.buttonsResponseMessage?.selectedButtonId,
    protocolMessage: msg.message.protocolMessage
  };
}

/**
 * Verifica se a mensagem deve ser ignorada (histórico, protocolo, etc)
 * @param {Object} msg - Mensagem do WhatsApp
 * @returns {boolean}
 */
function shouldIgnoreMessage(msg) {
  if (!msg || !msg.message) return true;
  if (msg.message.protocolMessage?.type) return true;
  return false;
}

module.exports = {
  parseMessage,
  shouldIgnoreMessage
};
