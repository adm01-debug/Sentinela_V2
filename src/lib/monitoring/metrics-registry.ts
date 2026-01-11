const registry = new Map<string, any>();

export function registerMetric(name: string, config: any): void { registry.set(name, config); }
export function getMetric(name: string): any { return registry.get(name); }
export function getAllMetrics(): Map<string, any> { return registry; }
