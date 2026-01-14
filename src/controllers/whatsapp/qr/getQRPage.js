const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const whatsappService = require("../../../services/whatsapp");

/**
 * Retorna página HTML com QR Code
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function getQRPage(req, res) {
  const qr = whatsappService.getQRCode();
  const isConnected = whatsappService.getStatus();
  const apiKey = req.query.API_KEY || "";

  try {
    const qrDataURL = qr ? await QRCode.toDataURL(qr, {
      width: 400,
      margin: 2
    }) : null;

    // Carrega o template HTML
    const templatePath = path.join(__dirname, "../../../views/qr.html");
    let html = fs.readFileSync(templatePath, "utf-8");

    // Define os estados
    const statusText = isConnected ? "Conectado" : (qrDataURL ? "Aguardando Scan" : "Inicializando");
    const titleText = isConnected ? "✅ Conectado!" : (qrDataURL ? "📲 Escaneie o QR" : "⏳ Inicializando...");
    const descText = isConnected ? "O bot está online e pronto." : "Abra o WhatsApp e escaneie o código abaixo.";
    const qrHiddenClass = isConnected ? "hidden" : "";
    const instrHiddenClass = isConnected || !qrDataURL ? "hidden" : "";
    const qrContent = qrDataURL ? `<img src="${qrDataURL}" id="qr-img">` : `<div class="loader"></div>`;

    // Substitui placeholders no HTML
    html = html
      .replace("{{STATUS_TEXT}}", statusText)
      .replace("{{TITLE_TEXT}}", titleText)
      .replace("{{DESC_TEXT}}", descText)
      .replace("{{QR_HIDDEN_CLASS}}", qrHiddenClass)
      .replace("{{INSTR_HIDDEN_CLASS}}", instrHiddenClass)
      .replace("{{QR_CONTENT}}", qrContent)
      .replace("{{API_KEY}}", apiKey)
      .replace("{{IS_CONNECTED}}", isConnected.toString());

    res.send(html);
  } catch (error) {
    res.status(500).send(`<h1>Erro ao gerar QR Code</h1><p>${error.message}</p>`);
  }
}

module.exports = getQRPage;
