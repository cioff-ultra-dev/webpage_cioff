import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export function generateHashPassword(rawPassword: string): Promise<string> {
  return bcrypt.hash(rawPassword, SALT_ROUNDS);
}

export function isSamePassword(
  rawPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(rawPassword, hashedPassword);
}
