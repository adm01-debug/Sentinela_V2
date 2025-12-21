import os from 'os';

export function getHardwareInfo() {
  return {
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
  };
}