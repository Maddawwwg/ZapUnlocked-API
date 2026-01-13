const { parseMessage, shouldIgnoreMessage } = require("../utils/messageParser");
const { createStickerFromImage, convertStickerToImage } = require("./stickerHandler");
const { verifyAndDecodePayload } = require("../utils/callbackUtils");
const { triggerWebhook } = require("../services/webhookService");
const logger = require("../utils/logger");

/**
 * Handler principal para processar mensagens recebidas
 * @param {Object} sock - Socket do WhatsApp
 * @param {Object} msgUpsert - Dados da mensagem recebida
 */
async function handleMessage(sock, msgUpsert) {
  if (!msgUpsert.messages) return;
  const msg = msgUpsert.messages[0];

  // Ignora mensagens que devem ser ignoradas
  if (shouldIgnoreMessage(msg)) return;

  // Parseia a mensagem
  const parsed = parseMessage(msg);
  if (!parsed) return;

  const { jid, phone, text, imageMessage, quotedImage, quotedSticker, buttonResponse, quotedMessage } = parsed;

  const messageText = text || "";
  const selectedButtonId = buttonResponse || "";

  // ================== CALLBACK DE WEBHOOK NO BOTÃO (cb=) ==================

  // O callback pode vir no ID do botão (clique direto) ou no texto (alguns clientes legados)
  const callbackPart = selectedButtonId.startsWith("cb=")
    ? selectedButtonId.substring(3)
    : (messageText.includes("|cb=") ? messageText.split("|cb=")[1] : null);

  if (callbackPart) {
    const webhookConfig = verifyAndDecodePayload(callbackPart);

    if (webhookConfig) {
      // O 'text' agora vem preenchido pelo parser como o texto visível do botão
      const buttonLabel = text;
      logger.log(`🎯 Callback detectado: "${buttonLabel}" de ${phone}`);

      triggerWebhook(webhookConfig, {
        from: phone,
        text: buttonLabel || text // Fallback para garantir que {{text}} nunca venha vazio
      }).catch(err => logger.error("Erro ao disparar webhook:", err.message));
    } else if (selectedButtonId.startsWith("cb=")) {
      logger.warn(`⚠️ Callback inválido ou expirado recebido de ${phone}`);
    }

    // Se era um botão com callback, interrompemos para não cair em comandos de texto
    if (selectedButtonId.startsWith("cb=")) return;
  }

  // Debug: log quando detecta .f no texto
  if (text.includes(".f")) {
    logger.log(`🔍 Debug .f: text="${text}", hasImage=${!!imageMessage}, hasQuoted=${!!quotedMessage}, hasQuotedImage=${!!quotedImage}`);
  }

  // ================== COMANDO .f (Criar Figurinha) ==================

  // Caso 1: Imagem com legenda contendo .f (ex: "minha foto .f" ou apenas ".f")
  // Verifica se há imagem na mensagem atual E se o texto contém .f
  if (imageMessage && text.includes(".f")) {
    logger.log("✅ Caso 1: Imagem com .f na legenda");
    await createStickerFromImage(sock, jid, msg, imageMessage, false);
    return;
  }

  // Caso 2: Responder qualquer mensagem com .f
  // Quando você responde, verifica se há mensagem citada que é uma imagem
  // E se o texto da resposta contém .f
  if (quotedMessage && quotedImage && text.includes(".f")) {
    logger.log("✅ Caso 2: Resposta com .f para imagem citada");
    await createStickerFromImage(sock, jid, msg, quotedImage, true);
    return;
  }

  // ================== COMANDO .t (Converter Figurinha em Foto) ==================

  if (quotedSticker && text === ".t") {
    await convertStickerToImage(sock, jid, msg, quotedSticker);
    return;
  }

}

module.exports = { handleMessage };
