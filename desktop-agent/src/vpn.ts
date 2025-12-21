import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function isVPNConnected(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('route print');
    return stdout.includes('VPN') || stdout.includes('tun');
  } catch { return false; }
}