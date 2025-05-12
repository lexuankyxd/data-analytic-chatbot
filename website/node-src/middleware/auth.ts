const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { Request, Response } from 'express';
import { randomBytes } from "node:crypto";
// var SECRET_KEY: string = randomBytes(64).toString('hex');
const SECRET_ACCESS_KEY: string = "skibidy", SECRET_REFRESH_KEY: string = "toilet";

export function generateToken(user_identifier: string): string[] {
  const access_token = jwt.sign({ user_identifier }, SECRET_ACCESS_KEY, { expiresIn: '15m' });
  const refresh_token = jwt.sign({ user_identifier }, SECRET_REFRESH_KEY, { expiresIn: '12h' });
  return [access_token, refresh_token];
}

export function refreshAccessToken(token: string): string {
  const tkn = verifyRefreshToken(token);
  if (tkn == "INVALID TOKEN") return "INVALID TOKEN";
  const newToken = jwt.sign({ user_identifier: tkn }, SECRET_ACCESS_KEY, { expiresIn: '15m' });
  return newToken;
}

export function verifyRefreshToken(token: string): string {
  try {
    const decoded = jwt.verify(token, SECRET_REFRESH_KEY);
    return decoded.user_identifier;
  } catch (error) {
    return "INVALID TOKEN";
  }
}

export function verifyAccessToken(token: string): string {
  try {
    const decoded = jwt.verify(token, SECRET_ACCESS_KEY);
    return decoded.user_identifier;
  } catch (error) {
    return "INVALID TOKEN";
  }
}

export async function protect(req: any, res: Response, next: CallableFunction) {
  let token;
  // Kiểm tra token trong Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(" ")[1];

      // Giải mã và lấy thông tin user từ token
      const decoded = jwt.verify(token, SECRET_ACCESS_KEY);
      req.user_email = decoded.user_identifier;
      next(); // Cho phép tiếp tục vào route tiếp theo
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ message: "Invalid access token" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "No access token attached, rejecting request" });
  }
}
