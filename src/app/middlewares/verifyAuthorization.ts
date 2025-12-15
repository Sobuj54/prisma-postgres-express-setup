import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';

type Roles = 'super_admin' | 'admin' | 'agent' | 'member';

export const verifyAuthorization =
  ([...roles]: Roles[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }
    if (!roles.includes(req.user.role))
      throw new ApiError(403, 'Unauthorized User');
    next();
  };
