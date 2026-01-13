let requestCount = 0;
export const recordRequest = () => { requestCount++; };
export const getMetrics = () => ({ requests: requestCount, memory: process.memoryUsage(), uptime: process.uptime() });
