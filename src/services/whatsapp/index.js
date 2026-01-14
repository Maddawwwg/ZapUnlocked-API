const client = require("./client");
const sender = require("./sender");

module.exports = {
    // Client Connection
    startBot: client.startBot,
    logout: client.logout,
    getStatus: client.isReady,
    getSocket: client.getSock,
    getQRCode: client.getQR,

    // Message Sending
    sendMessage: sender.sendMessage,
    sendButtonMessage: sender.sendButtonMessage,
    sendImageMessage: sender.sendImageMessage,
    sendAudioMessage: sender.sendAudioMessage,
    sendVideoMessage: sender.sendVideoMessage,
    sendDocumentMessage: sender.sendDocumentMessage,
    sendStickerMessage: sender.sendStickerMessage
};
