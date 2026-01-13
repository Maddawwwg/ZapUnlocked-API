const fs = require("fs");
const path = require("path");
const { AUTH_DIR } = require("../config/constants");
const logger = require("../utils/logger");

/**
 * Serviço para gerenciar sessões do WhatsApp
 */

/**
 * Apaga todos os arquivos da sessão
 * @returns {Promise<Object>} - Resultado da operação
 */
async function clearSession() {
  try {
    // Verifica se o diretório existe
    if (!fs.existsSync(AUTH_DIR)) {
      return {
        success: true,
        message: "Sessão já estava limpa"
      };
    }

    // Lista todos os arquivos na pasta auth_info
    const files = fs.readdirSync(AUTH_DIR);
    
    // Remove todos os arquivos
    const removedFiles = [];
    files.forEach(file => {
      const filePath = path.join(AUTH_DIR, file);
      try {
        fs.unlinkSync(filePath);
        removedFiles.push(file);
        logger.log(`🗑️ Arquivo removido: ${file}`);
      } catch (error) {
        logger.error(`❌ Erro ao remover ${file}:`, error.message);
      }
    });

    // Tenta remover o diretório (pode falhar se não estiver vazio, mas não é crítico)
    try {
      fs.rmdirSync(AUTH_DIR);
    } catch (error) {
      // Ignora erro se o diretório não estiver vazio
    }

    logger.log("✅ Sessão apagada com sucesso");

    return {
      success: true,
      message: "Sessão apagada com sucesso. Reinicie o bot para gerar novo QR Code.",
      removedFiles: removedFiles.length
    };
  } catch (error) {
    logger.error("❌ Erro ao apagar sessão:", error.message);
    throw error;
  }
}

module.exports = {
  clearSession
};
