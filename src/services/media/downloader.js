const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { TEMP_DIR } = require("../../config/constants");
const logger = require("../../utils/logger");
const { cleanup } = require("./utils");

const MAX_SIZE = 400 * 1024 * 1024; // 400 MB

/**
 * Faz download de uma mídia de uma URL
 * @param {string} url - URL da mídia
 * @returns {Promise<string>} - Caminho local do arquivo salvo
 */
async function downloadMedia(url) {
    logger.log(`🌐 Iniciando download da URL: ${url}`);

    try {
        const commonHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Referer": "https://www.google.com/"
        };

        let contentLength = 0;
        try {
            const headResponse = await axios.head(url, {
                headers: commonHeaders,
                timeout: 5000,
                validateStatus: (status) => status < 400
            });
            contentLength = parseInt(headResponse.headers["content-length"] || 0);
        } catch (e) {
            logger.log(`⚠️ HEAD falhou (${e.message}), tentando via GET...`);
        }

        if (contentLength > MAX_SIZE) {
            const sizeMB = (contentLength / (1024 * 1024)).toFixed(2);
            throw new Error(`Arquivo muito grande: ${sizeMB}MB. O limite máximo é 400MB.`);
        }

        const response = await axios({
            method: "get",
            url: url,
            responseType: "stream",
            headers: commonHeaders,
            timeout: 60000
        });

        const actualSize = parseInt(response.headers["content-length"] || 0);
        if (actualSize > MAX_SIZE) {
            const sizeMB = (actualSize / (1024 * 1024)).toFixed(2);
            throw new Error(`Arquivo muito grande: ${sizeMB}MB. O limite máximo é 400MB.`);
        }

        const contentType = response.headers["content-type"] || "";
        let extension = ".bin";

        if (contentType.includes("image/")) extension = "." + contentType.split("/")[1].split(";")[0];
        else if (contentType.includes("video/")) extension = "." + contentType.split("/")[1].split(";")[0];
        else if (contentType.includes("audio/")) extension = "." + contentType.split("/")[1].split(";")[0];
        else if (contentType.includes("application/pdf")) extension = ".pdf";

        if (extension === ".jpeg") extension = ".jpg";
        if (extension === ".mpeg") {
            extension = contentType.includes("audio") ? ".mp3" : ".mp4";
        }

        const filename = `${crypto.randomUUID()}${extension}`;
        const filePath = path.join(TEMP_DIR, filename);
        const writer = fs.createWriteStream(filePath);

        logger.log(`⏳ Gravando stream no arquivo: ${filename}...`);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                const stats = fs.statSync(filePath);
                logger.log(`✅ Download concluído: ${path.basename(filePath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
                resolve(filePath);
            });
            writer.on("error", (err) => {
                logger.error("❌ Erro no writer do stream:", err.message);
                cleanup(filePath);
                reject(err);
            });
            response.data.on("error", (err) => {
                logger.error("❌ Erro no stream de dados:", err.message);
                cleanup(filePath);
                reject(err);
            });
        });
    } catch (error) {
        logger.error("❌ Erro ao baixar mídia:", error.message);
        throw error;
    }
}

module.exports = { downloadMedia };
