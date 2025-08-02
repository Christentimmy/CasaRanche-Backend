

import "express";

declare module "express" {
  interface Request {
    userId?: string;
    role?: string;
    user?: IUser;
  }
}
