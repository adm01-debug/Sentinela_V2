export const loggerMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on("finish", () => { console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${Date.now() - start}ms)`); });
  next();
};
