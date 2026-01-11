const AutoLaunch = require('auto-launch');
const path = require('path');
const appName = 'Sentinela Agent';
const autoLauncher = new AutoLaunch({ name: appName, path: process.execPath });
async function enable() { try { await autoLauncher.enable(); return true; } catch (err) { console.error('AutoLaunch enable error:', err); return false; } }
async function disable() { try { await autoLauncher.disable(); return true; } catch (err) { console.error('AutoLaunch disable error:', err); return false; } }
async function isEnabled() { try { return await autoLauncher.isEnabled(); } catch { return false; } }
module.exports = { enable, disable, isEnabled };