import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Zod-validated data replaces raw input; cast required to satisfy Express types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    req[target] = result.data;
    next();
  };
}
