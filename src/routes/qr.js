const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const getQRPage = require("../controllers/whatsapp/qr/getQRPage");
const getQRImage = require("../controllers/whatsapp/qr/getQRImage");
const logout = require("../controllers/whatsapp/qr/logout");
const pairController = require("../controllers/whatsapp/qr/pairController"); // Importa novo controller

/**
 * Rotas relacionadas a QR Code e sessão
 */

// GET /qr - Página HTML com QR Code
router.get("/", auth, getQRPage);

// GET /qr/image - QR Code como imagem PNG
router.get("/image", auth, getQRImage);

// POST /qr/pair - Gerar Código de Pareamento
router.post("/pair", auth, pairController);

// POST /qr/logout - Apagar sessão
router.post("/logout", auth, logout);

module.exports = router;
