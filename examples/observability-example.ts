/**
 * Observability patterns example
 */
import { Tracer } from '../src/distributedTracing';
import { LogAggregator } from '../src/logAggregation';
import { MetricsCollector } from '../src/metricsCollection';
import { HealthChecker } from '../src/healthChecksAdvanced';
const tracer = new Tracer('api-service');
const logs = new LogAggregator();
const metrics = new MetricsCollector();
const health = new HealthChecker();
health.register({ name: 'db', check: async () => ({ status: 'healthy', latency: 5 }) });
async function handleRequest(path: string) {
  const span = tracer.startSpan('handleRequest');
  logs.add({ level: 'info', message: 'Request: ' + path, timestamp: Date.now() });
  metrics.increment('requests');
  tracer.endSpan(span);
}
