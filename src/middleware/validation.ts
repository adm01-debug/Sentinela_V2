import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (error: any) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
  };
};
