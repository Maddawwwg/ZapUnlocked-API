const express = require("express");
const router = express.Router();
const privacyController = require("../controllers/whatsapp/settings/privacyController");
const profileController = require("../controllers/whatsapp/settings/profileController");
const blockController = require("../controllers/whatsapp/contacts/blockController");
const { auth } = require("../middleware/auth");

router.use(auth);

// Configurações de Privacidade e Perfil
router.post("/privacy", privacyController.updatePrivacy);

// Atualizar Dados do Próprio Perfil (Nome, Foto)
router.post("/profile", profileController.updateMyProfile);

// Bloqueio de Usuários (agrupado em settings ou contacts, definindo aqui como /settings/block)
router.post("/block", blockController.blockUser);

module.exports = router;
