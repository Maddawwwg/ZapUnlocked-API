const fs = require("fs");
const path = require("path");
const { AUTH_DIR } = require("../../config/constants");

/**
 * Retorna estatísticas FOCADAS APENAS na pasta data (chats, jsons)
 */
const getVolumeStats = async (req, res) => {
    try {
        // Foca apenas na pasta 'data' dentro do projeto
        const dataDir = path.join(process.cwd(), "data");

        // Garante que existe para nao quebrar
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const stats = {
            totalSize: 0,
            fileCount: 0,
            structure: []
        };

        function scanDir(directory) {
            const items = fs.readdirSync(directory);
            const folderContent = [];

            for (const item of items) {
                const fullPath = path.join(directory, item);

                try {
                    const fileStat = fs.statSync(fullPath);
                    const isDirectory = fileStat.isDirectory();

                    if (isDirectory) {
                        const children = scanDir(fullPath);
                        folderContent.push({
                            name: item,
                            type: "folder",
                            size: children.reduce((acc, curr) => acc + curr.size, 0),
                            children: children
                        });
                    } else {
                        stats.totalSize += fileStat.size;
                        stats.fileCount++;
                        folderContent.push({
                            name: item,
                            type: "file",
                            size: fileStat.size
                        });
                    }
                } catch (err) { }
            }
            return folderContent;
        }

        stats.structure = scanDir(dataDir);

        // Formata tamanho total sempre em MB (ou KB se muito pequeno, mas usuario pediu foco em MB se possivel)
        // O usuario pediu "mostra o totalSizeFormatted sempre como MB", mas vamos fazer algo inteligente:
        // Se < 1 MB, mostra em KB pra não ficar "0.00 MB". Acima disso, MB.
        const formatSize = (bytes) => {
            if (bytes === 0) return "0.00 MB";
            const mb = bytes / (1024 * 1024);
            if (mb < 0.01) {
                return (bytes / 1024).toFixed(2) + " KB";
            }
            return mb.toFixed(2) + " MB";
        };

        return res.json({
            success: true,
            totalSizeBytes: stats.totalSize,
            totalSizeFormatted: formatSize(stats.totalSize),
            fileCount: stats.fileCount,
            structure: stats.structure
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Erro ao calcular estatísticas do volume",
            details: error.message
        });
    }
};

module.exports = getVolumeStats;
