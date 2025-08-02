
// types/express/index.d.ts
import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../models/user_model";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: string;
      user?: IUser; 
    }
  }
}
