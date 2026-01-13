const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

// Usa variável de ambiente ou caminho padrão
// Na Railway, configure AUTH_DIR para um volume persistente
// Exemplo: AUTH_DIR=/data/auth_info
const defaultAuthDir = path.join(__dirname, "auth_info");
const AUTH_DIR = process.env.AUTH_DIR || defaultAuthDir;

// Garante que o diretório existe
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let sock;

// ===== START WHATSAPP =====
async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true // mostra QR no terminal
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📲 QR Code gerado, escaneie com seu WhatsApp:");
      // opcional: mostra QR em terminal como base64
      console.log(await QRCode.toString(qr, { type: 'terminal', small: true }));
    }

    if (connection === "open") {
      console.log("✅ WhatsApp conectado!");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("⚠️ Conexão fechou:", reason);

      if (reason === DisconnectReason.loggedOut) {
        console.error("❌ Sessão inválida, precisa gerar novamente");
      } else {
        console.log("🔄 Tentando reconectar em 5s...");
        setTimeout(startWhatsApp, 5000);
      }
    }
  });
}

startWhatsApp();
