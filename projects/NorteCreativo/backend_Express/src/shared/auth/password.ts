import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';

const BCRYPT_ROUNDS = 12;

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, BCRYPT_ROUNDS);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> => bcrypt.compare(plain, hash);

// SHA-256 determinista: el refresh token se guarda hasheado, nunca en claro.
export const sha256Hex = (value: string): string => createHash('sha256').update(value).digest('hex');

// Token opaco de 64 bytes aleatorios (refresh token).
export const generateOpaqueToken = (): string => randomBytes(64).toString('base64url');
