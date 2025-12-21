import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getDiskUsage() {
  try {
    const { stdout } = await execAsync('df -h /');
    return stdout;
  } catch { return null; }
}