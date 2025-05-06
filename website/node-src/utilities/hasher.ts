const bcrypt = require('bcrypt');
const crypto = require('crypto');

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}

export function hashGeneral(str: string) {
  return crypto.createHash('sha256').update(str).digest('hex');
}
