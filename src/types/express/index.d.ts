// your user interface

import { UserDocument } from '../../modules/user/user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument; // optional because sometimes it may not exist
    }
  }
}
