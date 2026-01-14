const { getSock } = require("../../../services/whatsapp/client");
const logger = require("../../../utils/logger");

exports.getContactInfo = async (req, res) => {
    try {
        const sock = getSock();
        if (!sock) return res.status(503).json({ error: "WhatsApp não conectado" });

        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: "Número de telefone (phone) é obrigatório" });
        }

        const jid = `${phone}@s.whatsapp.net`;
        const info = { phone, jid };

        // 1. Foto de Perfil
        try {
            info.profilePictureUrl = await sock.profilePictureUrl(jid, "image");
        } catch (e) {
            info.profilePictureUrl = null; // Sem foto ou privado
        }

        // 2. Status (Recado)
        try {
            const statusData = await sock.fetchStatus(jid);
            info.status = statusData?.status || null;
            info.statusTimestamp = statusData?.setAt || null;
        } catch (e) {
            info.status = null;
        }

        // 3. Perfil Comercial (se houver)
        try {
            const businessProfile = await sock.getBusinessProfile(jid);
            info.businessProfile = {
                description: businessProfile?.description,
                category: businessProfile?.category,
                website: businessProfile?.website,
                email: businessProfile?.email
            };
        } catch (e) {
            info.businessProfile = null; // Não é conta comercial ou erro
        }

        // 4. Verificação se existe no WhatsApp
        try {
            const [result] = await sock.onWhatsApp(jid);
            info.exists = result?.exists || false;
        } catch (e) {
            info.exists = "unknown";
        }

        res.json({ success: true, data: info });

    } catch (err) {
        logger.error(`Erro ao buscar info de ${req.body.phone}`, err.message);
        res.status(500).json({ error: err.message });
    }
};
