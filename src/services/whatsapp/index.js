// Lazy load dependencies to save RAM on startup
const getClient = () => require("./client");
const getSender = () => require("./sender");
const getFetcher = () => require("./messageFetcher");

module.exports = {
    // Client Connection
    startBot: (...args) => getClient().startBot(...args),
    logout: (...args) => getClient().logout(...args),
    getStatus: () => getClient().isReady(),
    getSocket: () => getClient().getSock(),
    getQRCode: () => getClient().getQR(),
    getStore: () => getClient().getStore(),

    // Message Sending
    sendMessage: (...args) => getSender().sendMessage(...args),
    sendButtonMessage: (...args) => getSender().sendButtonMessage(...args),
    sendImageMessage: (...args) => getSender().sendImageMessage(...args),
    sendAudioMessage: (...args) => getSender().sendAudioMessage(...args),
    sendVideoMessage: (...args) => getSender().sendVideoMessage(...args),
    sendDocumentMessage: (...args) => getSender().sendDocumentMessage(...args),
    sendStickerMessage: (...args) => getSender().sendStickerMessage(...args),

    // Management & History
    fetchMessages: (...args) => getFetcher().fetchMessages(...args),
    getRecentChats: (...args) => getFetcher().getRecentChats(...args),

    // Reactions & Helpers
    sendReaction: (...args) => getSender().sendReaction(...args),
    findMessage: (...args) => getSender().findMessage(...args),
    getReactionCache: () => getClient().getReactionCache()
};
