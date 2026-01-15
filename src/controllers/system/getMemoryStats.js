const os = require("os");

/**
 * Retorna estatísticas detalhadas de uso de memória
 */
async function getMemoryStats(req, res) {
    // Gatilho manual via query ?gc=true
    if (req.query.gc === "true" && global.gc) {
        global.gc();
    }

    const memory = process.memoryUsage();
    const whatsappService = require("../../services/whatsapp");
    const contactCount = whatsappService.getStore() ? Object.keys(whatsappService.getStore().contacts).length : 0;

    // Converte para MB
    const stats = {
        process: {
            rss: (memory.rss / 1024 / 1024).toFixed(2) + " MB",
            heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2) + " MB",
            heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2) + " MB",
            external: (memory.external / 1024 / 1024).toFixed(2) + " MB",
            arrayBuffers: (memory.arrayBuffers / 1024 / 1024).toFixed(2) + " MB",
        },
        whatsapp: {
            contactsInMemory: contactCount
        },
        system: {
            total: (os.totalmem() / 1024 / 1024).toFixed(2) + " MB",
            free: (os.freemem() / 1024 / 1024).toFixed(2) + " MB",
            usagePercent: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2) + "%"
        },
        uptime: process.uptime().toFixed(0) + " s",
        gcEnabled: !!global.gc
    };

    res.json(stats);
}

module.exports = getMemoryStats;
