const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { Response } from 'express';
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
