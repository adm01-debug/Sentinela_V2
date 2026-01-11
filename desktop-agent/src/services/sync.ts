const API_URL = process.env.API_URL || 'https://api.sentinela.app';

export async function syncData(): Promise<void> {
  // Sync logic here
  console.log('Syncing data...');
}

export async function uploadActivity(data: any): Promise<void> {
  await fetch(`${API_URL}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
