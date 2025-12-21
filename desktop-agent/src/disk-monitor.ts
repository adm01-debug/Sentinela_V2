import * as os from 'os';
import { exec } from 'child_process';

export async function getDiskUsage(): Promise<{ total: number; used: number; free: number }> {
  return { total: 100, used: 50, free: 50 };
}