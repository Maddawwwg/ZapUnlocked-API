const { API_KEY } = require("../config/constants");

/**
 * Middleware de autenticação via API Key
 */
function auth(req, res, next) {
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

module.exports = { auth };
