const { parseMessage, shouldIgnoreMessage } = require("../utils/messageParser");
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

  const { phone, text, buttonResponse } = parsed;

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
      const buttonLabel = text || "Botão clicado";
      logger.log(`🎯 Callback detectado: "${buttonLabel}" de ${phone}`);

      // Se houver um emoji de reação configurado, reage à resposta do usuário
      if (webhookConfig.reaction) {
        try {
          await sock.sendMessage(phone + "@s.whatsapp.net", {
            react: {
              text: webhookConfig.reaction,
              key: msg.key
            }
          });
          logger.log(`💖 Reagiu com ${webhookConfig.reaction} para ${phone}`);
        } catch (err) {
          logger.error("Erro ao reagir à mensagem:", err.message);
        }
      }

      // Dispara o webhook (se houver URL configurada)
      if (webhookConfig.url) {
        triggerWebhook(webhookConfig, {
          from: phone,
          text: buttonLabel
        }).catch(err => logger.error("Erro ao disparar webhook:", err.message));
      }
    } else if (selectedButtonId.startsWith("cb=")) {
      logger.warn(`⚠️ Callback inválido ou expirado recebido de ${phone}`);
    }

    // Se era um botão com callback, interrompemos aqui.
    return;
  }
}

module.exports = { handleMessage };
