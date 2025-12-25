/**
 * Observability patterns example
 */
import { 
  createLogger, 
  MetricsRegistry, 
  Tracer,
  HealthChecker 
} from '@sentinela/core';

// Structured Logging
const logger = createLogger('my-service');
logger.info('Service started', { version: '1.0.0', env: 'production' });
logger.warn('High memory usage', { memoryMB: 450, threshold: 400 });

// Metrics
const registry = new MetricsRegistry();
const requestCounter = registry.counter('http_requests_total', 'Total HTTP requests');
const latencyHistogram = registry.histogram('http_request_duration_seconds', 'Request latency');

requestCounter.inc({ method: 'GET', path: '/api/users' });
latencyHistogram.observe(0.125, { method: 'GET', path: '/api/users' });

// Distributed Tracing
const tracer = new Tracer({ serviceName: 'api-gateway' });
async function handleRequest() {
  const span = tracer.startSpan('handle-request');
  span.setTag('http.method', 'GET');
  span.setTag('http.url', '/api/users');
  
  const dbSpan = tracer.startSpan('database-query', { parent: span });
  await new Promise(r => setTimeout(r, 50));
  dbSpan.end();
  
  span.end();
}

// Health Checks
const healthChecker = new HealthChecker();
healthChecker.register('database', async () => ({ status: 'healthy', latency: 5 }));
healthChecker.register('cache', async () => ({ status: 'healthy', latency: 2 }));

async function main() {
  await handleRequest();
  const health = await healthChecker.runAll();
  console.log('Health:', health);
  console.log('Metrics:', registry.getAll());
}
main();
