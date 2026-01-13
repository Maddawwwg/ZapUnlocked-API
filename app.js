/**
 * Entry Point Principal da Aplicação
 * 
 * Este arquivo é a base da aplicação, responsável por:
 * - Inicializar o servidor Express
 * - Iniciar o serviço do WhatsApp
 * - Orquestrar todos os módulos da aplicação
 */

const createApp = require("./src/app");
const whatsappService = require("./src/services/whatsapp");
const { PORT } = require("./src/config/constants");
const logger = require("./src/utils/logger");

// ===================== INICIALIZAÇÃO =====================

// Inicializa o app Express com todas as rotas e middlewares
const app = createApp();

// Inicia o servidor HTTP
app.listen(PORT, () => {
  logger.log(`🚀 API rodando na porta ${PORT}`);
});

// Inicia o bot do WhatsApp
whatsappService.startBot();
