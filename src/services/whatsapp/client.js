const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@itsukichan/baileys");
const fs = require("fs");
const path = require("path");
const { AUTH_DIR, WHATSAPP_CONFIG, RECONNECT_DELAY } = require("../../config/constants");
const { handleMessage } = require("../../handlers/messageHandler");
const logger = require("../../utils/logger");

let sock = null;
let isReady = false;
let currentQR = null;

/**
 * Inicia o bot do WhatsApp
 * @returns {Promise<void>}
 */
async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            auth: state,
            ...WHATSAPP_CONFIG
        });

        sock.ev.on("creds.update", async () => {
            await saveCreds();
            logger.log("💾 Credenciais do WhatsApp atualizadas/salvas");
        });

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                currentQR = qr;
                logger.log("📲 QR Code gerado! Acesse /qr no navegador para escanear");
            }

            if (connection === "open") {
                isReady = true;
                currentQR = null;
                logger.log("✅ WhatsApp conectado e pronto");
            }

            if (connection === "close") {
                isReady = false;
                currentQR = null;
                const reason = lastDisconnect?.error?.output?.statusCode;
                logger.log("⚠️ Conexão fechou:", reason);

                if (reason !== DisconnectReason.loggedOut) {
                    logger.log(`🔄 Tentando reconectar em ${RECONNECT_DELAY / 1000}s...`);
                    setTimeout(startBot, RECONNECT_DELAY);
                } else {
                    logger.error("❌ Sessão inválida (401), limpando e reiniciando...");
                    logout();
                }
            }
        });

        sock.ev.on("messages.upsert", async (msgUpsert) => {
            await handleMessage(sock, msgUpsert);
        });
    } catch (error) {
        logger.error("❌ Erro ao iniciar bot:", error.message);
        setTimeout(startBot, RECONNECT_DELAY);
    }
}

/**
 * Faz logout e limpa a sessão
 */
async function logout() {
    logger.log("🗑️ Iniciando processo de logout e limpeza de sessão...");

    try {
        if (sock) {
            if (isReady) {
                try {
                    await sock.logout();
                } catch (e) { }
            }
            sock.ev.removeAllListeners();
            sock = null;
        }
    } catch (err) {
        logger.error("⚠️ Erro ao fechar socket:", err.message);
    }

    isReady = false;
    currentQR = null;

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (fs.existsSync(AUTH_DIR)) {
        try {
            const files = fs.readdirSync(AUTH_DIR);
            for (const file of files) {
                const filePath = path.join(AUTH_DIR, file);
                try {
                    fs.unlinkSync(filePath);
                } catch (err) { }
            }
            try {
                fs.rmdirSync(AUTH_DIR);
            } catch (err) { }
        } catch (err) { }
    }

    logger.log("🔄 Reiniciando bot para novo escaneamento...");
    setTimeout(startBot, 2000);
}

module.exports = {
    startBot,
    logout,
    getSock: () => sock,
    isReady: () => isReady,
    getQR: () => currentQR
};
