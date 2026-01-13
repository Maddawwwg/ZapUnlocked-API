// ===================== SILENCIAR LOGS LID =====================
const originalLog = console.log;

console.log = (...args) => {
  if (args[0]?.includes?.("Migrated to LID encryption")) return;
  originalLog(...args);
};

module.exports = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.log
};
