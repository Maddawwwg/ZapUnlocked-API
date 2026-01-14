const express = require("express");
const routes = require("./routes");
const sendRoutes = require("./routes/send");
const qrRoutes = require("./routes/qr");
const logger = require("./utils/logger");

/**
 * Configuração e inicialização do Express
 */
function createApp() {
  const app = express();

  // Middlewares
  app.use(express.json());
  app.set("json spaces", 2); // Pretty-print JSON responses

  // Middleware para capturar erros de JSON malformado
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      logger.error("⚠️ Payload JSON malformado recebido:", err.message);
      return res.status(400).json({
        error: "JSON malformado",
        message: "O corpo da requisição contém um erro de sintaxe JSON. Verifique vírgulas e aspas.",
        details: err.message
      });
    }
    next();
  });

  // Rotas
  app.use("/", routes);
  app.use("/", sendRoutes);
  app.use("/qr", qrRoutes);
  app.use("/management", require("./routes/management"));
  app.use("/settings", require("./routes/settings")); // Rotas de privacidade e bloqueio
  app.use("/contacts", require("./routes/contacts")); // Novas rotas de info de contato

  return app;
}

module.exports = createApp;
