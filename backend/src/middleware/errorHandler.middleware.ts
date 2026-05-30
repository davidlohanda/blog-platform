import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError';
import { log } from '../lib/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.errorCode,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: 'Input validation failed',
      details: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  log.error('[UnhandledError]', err);

  res.status(500).json({
    success: false,
    statusCode: 500,
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
