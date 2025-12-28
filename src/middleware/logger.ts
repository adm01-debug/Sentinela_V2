export type LoggerRequest = { method: string; path: string };
export type LoggerResponse = {
  statusCode: number;
  on: (event: 'finish', cb: () => void) => void;
};
export type NextFunction = () => void;

export const loggerMiddleware = (req: LoggerRequest, res: LoggerResponse, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      JSON.stringify({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
    );
  });

  next();
};
