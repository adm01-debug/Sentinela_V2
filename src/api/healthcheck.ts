export const healthcheck = { status: "ok", timestamp: new Date().toISOString(), version: "19.0.0" };
export const getHealth = () => ({ ...healthcheck, uptime: process.uptime() });
