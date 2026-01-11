export async function startupProbe(): Promise<{ started: boolean; initTime: number }> {
  return { started: true, initTime: Date.now() };
}
