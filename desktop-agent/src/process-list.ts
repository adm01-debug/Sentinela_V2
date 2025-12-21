import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getProcessList() {
  const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux';
  const { stdout } = await execAsync(cmd);
  return stdout;
}