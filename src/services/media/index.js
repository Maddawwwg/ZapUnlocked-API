const getDownloader = () => require("./downloader");
const getImageConverter = () => require("./imageConverter");
const getAudioConverter = () => require("./audioConverter");
const getVideoConverter = () => require("./videoConverter");
const getUtils = () => require("./utils");

module.exports = {
    downloadMedia: (...args) => getDownloader().downloadMedia(...args),
    convertToWebP: (...args) => getImageConverter().convertToWebP(...args),
    convertToOgg: (...args) => getAudioConverter().convertToOgg(...args),
    convertToMp4: (...args) => getVideoConverter().convertToMp4(...args),
    cleanup: (...args) => getUtils().cleanup(...args),
    getFileSize: (...args) => getUtils().getFileSize(...args)
};
