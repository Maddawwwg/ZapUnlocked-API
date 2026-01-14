const logger = require("../../utils/logger");
const client = require("./client");

/**
 * Busca mensagens do WhatsApp sob demanda
 * @param {string} jid - JID do contato
 * @param {number} limit - Quantidade de mensagens (max 100)
 * @param {string} type - Tipo de mensagens ('sent', 'received', 'all')
 * @returns {Promise<Object>}
 */
async function fetchMessages(jid, limit = 20, type = "all") {
    const sock = client.getSock();
    if (!sock) throw new Error("WhatsApp não conectado");

    logger.log(`🔍 Buscando ${limit} mensagens (${type}) para ${jid}...`);

    // Busca as mensagens do store em memória
    // Como habilitamos o syncFullHistoryLimit no constants.js, o store terá as mensagens recentes
    const store = client.getStore();
    const messages = await store.loadMessages(jid, limit);

    if (!messages || messages.length === 0) {
        return {
            requested: limit,
            found: 0,
            messages: []
        };
    }

    // Formata e filtra as mensagens
    let formattedMessages = messages.map(m => {
        const messageType = Object.keys(m.message || {})[0] || "unknown";
        let text = "";

        if (m.message?.conversation) {
            text = m.message.conversation;
        } else if (m.message?.extendedTextMessage?.text) {
            text = m.message.extendedTextMessage.text;
        } else if (m.message?.imageMessage) {
            text = m.message.imageMessage.caption || "[image_message]";
        } else if (m.message?.videoMessage) {
            text = m.message.videoMessage.caption || "[video_message]";
        } else if (m.message?.audioMessage) {
            text = "[audio_message]";
        } else if (m.message?.stickerMessage) {
            text = "[sticker_message]";
        } else if (m.message?.documentMessage) {
            text = m.message.documentMessage.caption || `[document_message: ${m.message.documentMessage.fileName || "arquivo"}]`;
        } else if (m.message?.contactMessage) {
            text = `[contact_message: ${m.message.contactMessage.displayName || "desconhecido"}]`;
        } else if (m.message?.locationMessage) {
            text = "[location_message]";
        } else if (m.message?.pollCreationMessage) {
            text = `[poll_message: ${m.message.pollCreationMessage.name}]`;
        } else if (m.message?.reactionMessage) {
            text = `[reaction: ${m.message.reactionMessage.text || "removida"}]`;
        } else if (m.message?.buttonsMessage) {
            text = m.message.buttonsMessage.contentText || "[button_message]";
        } else if (m.message?.listMessage) {
            text = m.message.listMessage.description || "[list_message]";
        } else if (m.message?.templateMessage) {
            text = m.message.templateMessage.hydratedTemplate?.hydratedContentText || "[template_message]";
        } else {
            text = `[${messageType}]`;
        }

        // Converte timestamp (pode vir como objeto Long do Baileys)
        const timestamp = m.messageTimestamp?.low || m.messageTimestamp || null;

        return {
            id: m.key.id,
            fromMe: m.key.fromMe,
            pushName: m.pushName || null,
            text: text,
            timestamp: timestamp,
            mimetype: m.message?.imageMessage?.mimetype ||
                m.message?.videoMessage?.mimetype ||
                m.message?.audioMessage?.mimetype ||
                m.message?.documentMessage?.mimetype || null,
            type: messageType,
            hasButtons: !!(m.message?.buttonsMessage || m.message?.listMessage || m.message?.templateMessage || m.message?.buttonsResponseMessage),
            reaction: m.message?.reactionMessage?.text || null
        };
    });

    // Filtros Avançados
    const { onlyReactions, reactionEmoji, query, onlyButtons } = arguments[3] || {};

    if (onlyReactions) {
        formattedMessages = formattedMessages.filter(m => m.type === "reactionMessage");
    }

    if (reactionEmoji) {
        formattedMessages = formattedMessages.filter(m => m.reaction === reactionEmoji);
    }

    if (query) {
        const q = query.toLowerCase();
        formattedMessages = formattedMessages.filter(m => m.text && m.text.toLowerCase().includes(q));
    }

    if (onlyButtons) {
        formattedMessages = formattedMessages.filter(m => m.hasButtons);
    }

    // Aplica filtro de tipo se necessário (sent/received)
    if (type === "sent") {
        formattedMessages = formattedMessages.filter(m => m.fromMe);
    } else if (type === "received") {
        formattedMessages = formattedMessages.filter(m => !m.fromMe);
    }

    // Inverte para as mais recentes virem primeiro se necessário
    // Baileys geralmente retorna cronológico (mais antigas primeiro)
    formattedMessages.reverse();

    return {
        requested: limit,
        found: formattedMessages.length,
        messages: formattedMessages.slice(0, limit)
    };
}

/**
 * Obtém os contatos recentes da sessão atual
 * @param {number} limit - Quantidade máxima de contatos
 * @returns {Array}
 */
function getRecentChats(limit = 20) {
    const store = client.getStore();
    if (!store) return [];

    // O store.chats contém os metadados dos chats sincronizados na sessão
    const chats = store.chats.all();

    const formattedChats = chats.map(c => {
        const store = client.getStore();
        // Se for LID, tenta achar o JID real no store.contacts
        let id = c.id;
        let phone = id.split("@")[0];

        // No Baileys, LID e JID são diferentes. Se for LID, o "nome" ou metadados podem estar no store.contacts
        const contact = store.contacts[id];

        // Converte timestamp
        const timestamp = c.conversationTimestamp?.low || c.conversationTimestamp || null;

        return {
            id: id,
            phone: phone,
            name: c.name || contact?.name || contact?.verifiedName || contact?.notify || null,
            unreadCount: c.unreadCount || 0,
            lastMessageTimestamp: timestamp
        };
    }).sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

    return formattedChats.slice(0, limit);
}

module.exports = {
    fetchMessages,
    getRecentChats
};
