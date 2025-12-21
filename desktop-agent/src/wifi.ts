import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getWifiInfo() {
  try {
    const cmd = process.platform === 'win32' ? 'netsh wlan show interfaces' : 'iwconfig 2>/dev/null';
    const { stdout } = await execAsync(cmd);
    return stdout;
  } catch { return null; }
}