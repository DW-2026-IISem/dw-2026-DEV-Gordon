import { randomUUID } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../errors/app-error';

export const JWT_ISSUER = 'norte-creativo-api';
export const JWT_AUDIENCE = 'norte-creativo-client';
const ALGORITHM = 'HS256' as const;
const MIN_SECRET_LENGTH = 32;

export interface AccessTokenClaims {
  userId: number;
  username: string;
  jti: string;
  exp: number;
}

// El secreto solo vive en .env: se lee en cada uso y se exige una longitud mínima.
const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET no está configurado o tiene menos de ${MIN_SECRET_LENGTH} caracteres`);
  }
  return secret;
};

export const getAccessTtlSeconds = (): number => {
  const ttl = Number(process.env.JWT_ACCESS_TTL ?? 900);
  return Number.isInteger(ttl) && ttl > 0 ? ttl : 900;
};

export const getRefreshTtlDays = (): number => {
  const days = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 7);
  return Number.isInteger(days) && days > 0 ? days : 7;
};

// Payload mínimo: nunca roles ni permisos (se resuelven en cada petición contra la matriz).
export const signAccessToken = (user: { id: number; username: string }): string =>
  jwt.sign({ username: user.username }, getSecret(), {
    algorithm: ALGORITHM,
    subject: String(user.id),
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: getAccessTtlSeconds(),
    jwtid: randomUUID(),
  });

// Verifica firma, algoritmo (solo HS256), iss, aud y exp; exige sub y jti.
export const verifyAccessToken = (token: string): AccessTokenClaims => {
  let payload: JwtPayload;
  try {
    const decoded = jwt.verify(token, getSecret(), {
      algorithms: [ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    if (typeof decoded === 'string') throw new Error('payload inválido');
    payload = decoded;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('JWT_SECRET')) throw error;
    throw new AppError(401, 'Token inválido o vencido');
  }
  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId < 1 || !payload.jti || typeof payload.username !== 'string' || !payload.exp) {
    throw new AppError(401, 'Token inválido o vencido');
  }
  return { userId, username: payload.username, jti: payload.jti, exp: payload.exp };
};

// RFC 6750: "Authorization: Bearer <token>". Devuelve null si no hay token utilizable.
export const extractBearerToken = (header: string | undefined): string | null => {
  if (!header) return null;
  const [scheme, token, ...resto] = header.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token || resto.length > 0) return null;
  return token;
};
