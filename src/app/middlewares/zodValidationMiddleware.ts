import { RequestHandler } from 'express';
import { ZodObject } from 'zod';

export const validateZodRequest = (
  schema: ZodObject,
  target: 'body' | 'params' | 'query' | 'cookies' = 'body'
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req[target]);
      req[target] = validatedData;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
