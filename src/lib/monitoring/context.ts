// OpenTelemetry stub - not available in browser bundle
const context = { active: () => ({}) };
const propagation = { extract: (_ctx: any, _headers: any) => ({}) };

export function extractContext(headers: Record<string, string>): any {
  return propagation.extract(context.active(), headers);
}
