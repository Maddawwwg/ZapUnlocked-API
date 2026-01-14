const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    makeInMemoryStore
} = require("@itsukichan/baileys");
const fs = require("fs");
const path = require("path");
const { AUTH_DIR, WHATSAPP_CONFIG, RECONNECT_DELAY } = require("../../config/constants");
const { handleMessage } = require("../../handlers/messageHandler");
const logger = require("../../utils/logger");

let sock = null;
let isReady = false;
let currentQR = null;

// Store em memória para contatos recentes
const store = makeInMemoryStore({});

// Cache global de reações (messageId -> emoji)
const reactionCache = new Map();

// Limite de mensagens por chat no store para economizar RAM
const MAX_MESSAGES_PER_CHAT = 100;
const MAX_CHATS_IN_STORE = 2000;
const MAX_REACTIONS_IN_CACHE = 5000; // Limite para evitar estouro de memória

/**
 * Armazena uma reação no cache global
 */
function storeReaction(targetId, emoji) {
    if (!targetId) return;

    // Se o emoji for vazio, a reação foi removida
    if (!emoji) {
        reactionCache.delete(targetId);
        return;
    }

    // Gerenciamento de memória do cache
    if (reactionCache.size >= MAX_REACTIONS_IN_CACHE) {
        const firstKey = reactionCache.keys().next().value;
        reactionCache.delete(firstKey);
    }

    reactionCache.set(targetId, emoji);
}

/**
 * Pruna o store para evitar consumo excessivo de RAM
 */
function pruneStore() {
    try {
        const chats = store.chats.all();
        if (chats.length > MAX_CHATS_IN_STORE) {
            // Apenas loga se houver excesso, o Baileys gerencia o store.chats.
        }

        // Limpa mensagens antigas de todos os chats no store
        for (const jid in store.messages) {
            const msgs = store.messages[jid];
            if (msgs && msgs.length > MAX_MESSAGES_PER_CHAT) {
                // Mantém apenas as últimas 100 mensagens
                // Redefinimos o array para garantir que seja uma operação limpa
                store.messages[jid] = msgs.slice(-MAX_MESSAGES_PER_CHAT);
            }
        }
    } catch (err) {
        logger.error("⚠️ Erro ao prunar store:", err.message);
    }
}

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

        // Vincula o store ao socket
        store.bind(sock.ev);

        sock.ev.on("creds.update", async () => {
            await saveCreds();
            logger.log("💾 Credenciais do WhatsApp atualizadas/salvas");
        });

        sock.ev.on("messaging.history-set", ({ messages }) => {
            logger.log(`📚 Sincronismo de histórico recebido: ${messages.length} mensagens.`);
        });

        // Captura reações via evento dedicado (messages.reaction)
        sock.ev.on("messages.reaction", (reactions) => {
            for (const r of reactions) {
                const targetId = r.reaction?.key?.id;
                const emoji = r.reaction?.text;
                if (targetId) {
                    storeReaction(targetId, emoji);
                    // logger.log(`🎭 Reação capturada (evento): ${emoji} para msg ${targetId}`);
                }
            }
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
            // Log para debug de mensagens em tempo real
            for (const m of msgUpsert.messages) {
                const jid = m.key.remoteJid;
                if (jid) {
                    // Fallback manual: garante que a mensagem entre no store
                    // Se o bind estiver funcionando (o que deveria), este push será ignorado ou redundante
                    if (!store.messages[jid]) store.messages[jid] = [];
                    const msgs = store.messages[jid];
                    const exists = msgs.find(x => x.key.id === m.key.id);

                    if (!exists) {
                        msgs.push(m);
                        // logger.log(`📥 [Fallback Store] Mensagem ${m.key.id} adicionada via upsert manual`);
                    }

                    const after = store.messages[jid].length;
                    logger.log(`📩 Evento UPSERT: ${jid} (fromMe: ${m.key.fromMe || "false"}). Msg no store depois: ${after}`);
                }

                // Também captura reações que chegam como mensagens normais (reactionMessage)
                const reaction = m.message?.reactionMessage;
                if (reaction) {
                    const targetId = reaction.key?.id;
                    const emoji = reaction.text;
                    storeReaction(targetId, emoji);
                }
            }

            await handleMessage(sock, msgUpsert);
            pruneStore(); // Limpa RAM após novas mensagens
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
    getQR: () => currentQR,
    getStore: () => store,
    getReactionCache: () => reactionCache
};
