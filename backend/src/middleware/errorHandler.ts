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
  const errAny = err as unknown as Record<string, unknown>;
  console.error('[ErrorHandler]', err.name, err.message, errAny['code'] ?? '');

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // MongoDB duplicate key error (code 11000)
  if ('code' in err && errAny['code'] === 11000) {
    const keyPattern = JSON.stringify(errAny['keyPattern'] || {});
    console.error(`[DuplicateKeyError] Clashing Key Pattern: ${keyPattern}`);
    
    res.status(409).json({ 
      error: 'Duplicate entry — resource already exists',
      details: `Field clash: ${keyPattern}`
    });
    return;
  }

  res.status(500).json({ error: err.message ?? 'Internal server error' });
};
