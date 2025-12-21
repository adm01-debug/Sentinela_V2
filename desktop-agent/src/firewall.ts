import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function checkFirewall() {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('netsh advfirewall show allprofiles state');
      return stdout.includes('ON');
    }
    return true;
  } catch { return false; }
}