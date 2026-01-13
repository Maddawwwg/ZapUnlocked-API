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

  // Captura legenda da imagem
  const imageCaption = msg.message.imageMessage?.caption?.toLowerCase() || "";

  // Captura texto de botões (se for uma resposta de botão)
  const buttonText = msg.message.buttonsResponseMessage?.selectedDisplayText?.toLowerCase() || "";

  // Texto completo: prioriza legenda da imagem, depois botão, depois extendedText, depois conversation
  const fullText = imageCaption || buttonText || extendedText || conversationText;

  // Verifica se há mensagem citada
  const contextInfo = msg.message.extendedTextMessage?.contextInfo ||
    msg.message.imageMessage?.contextInfo ||
    msg.message.stickerMessage?.contextInfo;

  const finalQuotedMessage = contextInfo?.quotedMessage;

  return {
    jid,
    phone: jid.split("@")[0],
    text: fullText,
    imageMessage: msg.message.imageMessage,
    quotedMessage: finalQuotedMessage,
    buttonResponse: msg.message.buttonsResponseMessage?.selectedButtonId
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
