const os = require('os');
const si = require('systeminformation');
async function getSystemInfo() {
  const [cpu, mem, disk, graphics, osInfo] = await Promise.all([si.cpu(), si.mem(), si.diskLayout(), si.graphics(), si.osInfo()]);
  return {
    os: { platform: osInfo.platform, distro: osInfo.distro, release: osInfo.release, arch: osInfo.arch },
    cpu: { brand: cpu.brand, cores: cpu.cores, speed: cpu.speed },
    memory: { total: mem.total, free: mem.free, used: mem.used },
    disk: disk.map(d => ({ name: d.name, size: d.size, type: d.type })),
    graphics: graphics.controllers.map(g => ({ model: g.model, vram: g.vram })),
    hostname: os.hostname(),
    username: os.userInfo().username
  };
}
async function getSystemStats() {
  const [currentLoad, mem] = await Promise.all([si.currentLoad(), si.mem()]);
  return { cpuLoad: currentLoad.currentLoad, memUsed: (mem.used / mem.total) * 100 };
}
module.exports = { getSystemInfo, getSystemStats };