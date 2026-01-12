# Load Testing Guide

## Overview
Performance and load testing procedures for Sentinela.

## Tools
- **k6**: Primary load testing tool
- **Artillery**: API stress testing
- **Lighthouse CI**: Frontend performance

## Test Scenarios

### Baseline Test
```javascript
// k6 script
export default function() {
  http.get("https://api.sentinela.app/health");
}
export const options = {
  vus: 100,
  duration: "5m",
};
```

### Stress Test
```javascript
export const options = {
  stages: [
    { duration: "2m", target: 100 },
    { duration: "5m", target: 500 },
    { duration: "2m", target: 1000 },
    { duration: "1m", target: 0 },
  ],
};
```

## Performance Targets
| Metric | Target | Maximum |
|--------|--------|---------|
| P50 Latency | 50ms | 100ms |
| P99 Latency | 200ms | 500ms |
| Throughput | 5,000 rps | - |
| Error Rate | 0% | 0.1% |

## Running Tests
```bash
k6 run scripts/load-test.js
k6 run --out influxdb=http://localhost:8086/k6 scripts/stress-test.js
```

## Related Documentation
- [PERFORMANCE.md](./PERFORMANCE.md)
- [SCALING.md](./SCALING.md)

