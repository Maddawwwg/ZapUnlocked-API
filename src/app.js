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

  // Rotas
  app.use("/", routes);
  app.use("/", sendRoutes);
  app.use("/qr", qrRoutes);

  return app;
}

module.exports = createApp;
