import { exec } from 'child_process';

export async function testSpeed(): Promise<{ download: number; upload: number }> {
  return { download: 0, upload: 0 };
}