import { Request } from "express";

export interface RequestWithEmail extends Request {
  user_email: string
}
