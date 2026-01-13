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

    if (isConnected) {
        return res.send(getConnectedPageHTML());
    }

    if (!qr) {
        return res.send(getWaitingPageHTML());
    }

    try {
        const qrDataURL = await QRCode.toDataURL(qr, {
            width: 400,
            margin: 2
        });

        res.send(getQRPageHTML(qrDataURL));
    } catch (error) {
        res.status(500).send(getErrorPageHTML(error.message));
    }
}

// Templates HTML
function getConnectedPageHTML() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp - Conectado</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        h1 { margin: 0 0 20px 0; font-size: 2.5em; }
        .status { font-size: 1.2em; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ WhatsApp Conectado!</h1>
        <p class="status">O bot está online e pronto para uso.</p>
      </div>
    </body>
    </html>
  `;
}

function getWaitingPageHTML() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="refresh" content="3">
      <title>WhatsApp - Aguardando QR Code</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⏳ Aguardando QR Code...</h1>
        <div class="loader"></div>
        <p>Esta página será atualizada automaticamente quando o QR Code estiver disponível.</p>
      </div>
    </body>
    </html>
  `;
}

function getQRPageHTML(qrDataURL) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp - Escanear QR Code</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 500px;
        }
        h1 { margin: 0 0 10px 0; }
        .qr-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          display: inline-block;
          margin: 20px 0;
        }
        .qr-container img {
          display: block;
          max-width: 100%;
          height: auto;
        }
        .instructions {
          margin-top: 20px;
          font-size: 1.1em;
          line-height: 1.6;
        }
        .refresh-btn {
          margin-top: 20px;
          padding: 10px 20px;
          background: white;
          color: #25D366;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1em;
          font-weight: bold;
        }
        .refresh-btn:hover {
          background: #f0f0f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📲 Escaneie o QR Code</h1>
        <p>Abra o WhatsApp no seu celular e escaneie este código</p>
        <div class="qr-container">
          <img src="${qrDataURL}" alt="QR Code WhatsApp">
        </div>
        <div class="instructions">
          <p><strong>Como escanear:</strong></p>
          <ol style="text-align: left; display: inline-block;">
            <li>Abra o WhatsApp no celular</li>
            <li>Vá em <strong>Configurações</strong> → <strong>Aparelhos conectados</strong></li>
            <li>Toque em <strong>Conectar um aparelho</strong></li>
            <li>Escaneie este QR Code</li>
          </ol>
        </div>
        <button class="refresh-btn" onclick="location.reload()">🔄 Atualizar</button>
      </div>
    </body>
    </html>
  `;
}

function getErrorPageHTML(errorMessage) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Erro</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: #f44336;
          color: white;
        }
      </style>
    </head>
    <body>
      <div>
        <h1>❌ Erro ao gerar QR Code</h1>
        <p>${errorMessage}</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = getQRPage;
