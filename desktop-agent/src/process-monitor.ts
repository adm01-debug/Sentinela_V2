import { exec } from 'child_process';

export async function getRunningProcesses(): Promise<{ name: string; pid: number; memory: number }[]> {
  return [];
}

export async function killProcess(pid: number): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`kill ${pid}`, (err) => resolve(!err));
  });
}