const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { Response } from 'express';
import { randomBytes } from "node:crypto";
var SECRET_KEY: string = randomBytes(64).toString('hex');

export function generateToken(user_id: string): string {
  const token = jwt.sign({ user_id }, SECRET_KEY, { expiresIn: '1d' });
  return token;
}

export function verifyToken(token: string): string {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded.user_id;
  } catch (error) {
    return "invalid token";
  }
}
