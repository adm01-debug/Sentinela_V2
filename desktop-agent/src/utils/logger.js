const fs = require('fs');
const path = require('path');
const os = require('os');
const logDir = path.join(os.homedir(), '.sentinela', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'agent-' + new Date().toISOString().split('T')[0] + '.log');
const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = process.env.LOG_LEVEL || 'info';
function log(level, message, meta = {}) {
  if (levels[level] < levels[currentLevel]) return;
  const timestamp = new Date().toISOString();
  const entry = JSON.stringify({ timestamp, level, message, ...meta }) + '\n';
  fs.appendFileSync(logFile, entry);
  if (level === 'error') console.error('[' + level.toUpperCase() + ']', message, meta);
  else console.log('[' + level.toUpperCase() + ']', message);
}
module.exports = {
  debug: (msg, meta) => log('debug', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta)
};