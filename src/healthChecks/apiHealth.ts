export async function checkApiHealth(url: string): Promise<{ healthy: boolean; latency: number; status?: number }> {
  const start = Date.now();
  try { const response = await fetch(url, { method: 'HEAD' }); return { healthy: response.ok, latency: Date.now() - start, status: response.status }; }
  catch { return { healthy: false, latency: Date.now() - start }; }
}
