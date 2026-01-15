const fs = require("fs");
const { getSock } = require("../../../services/whatsapp/client");
const logger = require("../../../utils/logger");
const { downloadMedia } = require("../../../services/media/downloader");

exports.updateMyProfile = async (req, res) => {
    let tempFilePath = null;

    try {
        const sock = getSock();
        if (!sock) return res.status(503).json({ error: "WhatsApp não conectado" });

        const { name, newProfilePictureUrl } = req.body;

        if (!name && !newProfilePictureUrl) {
            return res.status(400).json({ error: "Informe 'name' ou 'newProfilePictureUrl' para atualizar (envie ao menos um)." });
        }

        const updates = [];
        const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";

        if (name) {
            await sock.updateProfileName(name);
            updates.push(`Nome alterado para: ${name}`);
        }

        if (newProfilePictureUrl) {
            // 1. Usa o serviço existente para baixar a mídia com segurança
            tempFilePath = await downloadMedia(newProfilePictureUrl);

            // 2. Lê o arquivo para um Buffer (mais robusto que passar a URL no Baileys)
            const imageBuffer = fs.readFileSync(tempFilePath);

            // 3. Atualiza a foto usando o Buffer
            await sock.updateProfilePicture(botJid, imageBuffer);

            updates.push(`Foto de perfil atualizada.`);
        }

        logger.log(`👤 Perfil do Bot atualizado: ${updates.join(", ")}`);

        res.json({
            success: true,
            updated: updates
        });

    } catch (err) {
        logger.error("Erro ao atualizar perfil do bot", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        // Garante que o arquivo temporário seja apagado sempre
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {
                logger.error("Erro ao apagar arquivo temporário:", e.message);
            }
        }
    }
};
