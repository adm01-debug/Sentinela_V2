import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ActivityService {
  async getActiveWindow(): Promise<{ name: string; title: string } | null> {
    try {
      if (process.platform === 'win32') {
        // Windows implementation
        return { name: 'Unknown', title: 'Unknown' };
      } else if (process.platform === 'darwin') {
        // macOS implementation
        const { stdout } = await execAsync(
          'osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true''
        );
        return { name: stdout.trim(), title: '' };
      }
      return null;
    } catch {
      return null;
    }
  }
  
  async getIdleTime(): Promise<number> {
    // Returns idle time in seconds
    return 0;
  }
}
