const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");

/**
 * Remove um arquivo local com segurança
 * @param {string} filePath - Caminho do arquivo
 */
function cleanup(filePath) {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            logger.log(`🗑️ Arquivo temporário removido: ${path.basename(filePath)}`);
        } catch (error) {
            logger.error(`⚠️ Erro ao remover arquivo temporário: ${error.message}`);
        }
    }
}

/**
 * Obtém o tamanho do arquivo localmente
 * @param {string} filePath 
 * @returns {number} bytes
 */
function getFileSize(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.statSync(filePath).size;
    }
    return 0;
}

module.exports = {
    cleanup,
    getFileSize
};
