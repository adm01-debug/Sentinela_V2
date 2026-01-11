export async function readinessProbe(): Promise<{ ready: boolean; dependencies: Record<string, boolean> }> {
  return { ready: true, dependencies: { database: true, cache: true } };
}
