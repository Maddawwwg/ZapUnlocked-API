const express = require("express");
const router = express.Router();
const contactController = require("../controllers/whatsapp/contacts/contactController");
const { auth } = require("../middleware/auth");

router.use(auth);

// Obter informações de um número
router.post("/info", contactController.getContactInfo);

module.exports = router;
