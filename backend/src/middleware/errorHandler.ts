import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/StateMachine';

// Phase 8  Global Express error handler
// Must be registered as the last middleware in index.ts
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[ErrorHandler]', err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Mongoose duplicate key error
  if ('code' in err && (err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({ error: 'Duplicate entry  resource already exists' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
};
