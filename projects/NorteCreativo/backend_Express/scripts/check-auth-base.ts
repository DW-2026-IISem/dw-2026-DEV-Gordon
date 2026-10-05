// Evidencia de ISS-14: firma/verifica tokens y prueba hash/verify. Uso: npx ts-node scripts/check-auth-base.ts
import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword, sha256Hex, generateOpaqueToken } from '../src/shared/auth/password';
import { signAccessToken, verifyAccessToken, extractBearerToken, JWT_AUDIENCE, JWT_ISSUER } from '../src/shared/auth/jwt';
import { isOperationGranted, pathMatches } from '../src/shared/auth/resource-match';

let fallos = 0;
const check = (nombre: string, ok: boolean, detalle = ''): void => {
  if (!ok) fallos++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${nombre}${detalle ? ` -> ${detalle}` : ''}`);
};
const lanza = (fn: () => unknown): boolean => {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
};

async function main(): Promise<void> {
  // --- password ---
  const hash = await hashPassword('Clave-Segura-1');
  check('hash no es la contraseña en claro', hash !== 'Clave-Segura-1' && hash.startsWith('$2'));
  check('verify con contraseña correcta = true', (await verifyPassword('Clave-Segura-1', hash)) === true);
  check('verify con contraseña incorrecta = false', (await verifyPassword('otra', hash)) === false);
  check('sha256Hex determinista (64 hex)', sha256Hex('x') === sha256Hex('x') && sha256Hex('x').length === 64);
  check('generateOpaqueToken distinto cada vez', generateOpaqueToken() !== generateOpaqueToken());

  // --- jwt ---
  const token = signAccessToken({ id: 7, username: 'ana' });
  const claims = verifyAccessToken(token);
  check('token firmado se verifica', claims.userId === 7 && claims.username === 'ana' && !!claims.jti);
  const decoded = jwt.decode(token, { complete: true }) as jwt.Jwt;
  const p = decoded.payload as jwt.JwtPayload;
  check('header HS256', decoded.header.alg === 'HS256');
  check('claims iss/aud/exp/jti/sub', p.iss === JWT_ISSUER && p.aud === JWT_AUDIENCE && !!p.exp && !!p.jti && p.sub === '7');
  check('payload sin roles ni permisos', !('roles' in p) && !('permissions' in p));

  const [h, pl, firma] = token.split('.');
  const alterado = `${h}.${Buffer.from(JSON.stringify({ ...p, sub: '1' })).toString('base64url')}.${firma}`;
  check('token alterado falla', lanza(() => verifyAccessToken(alterado)));
  check('token con firma truncada falla', lanza(() => verifyAccessToken(`${h}.${pl}.${firma.slice(0, -2)}xx`)));

  const vencido = jwt.sign({ username: 'ana' }, process.env.JWT_SECRET as string, {
    algorithm: 'HS256', subject: '7', issuer: JWT_ISSUER, audience: JWT_AUDIENCE, jwtid: 'x', expiresIn: -10,
  });
  check('token vencido falla', lanza(() => verifyAccessToken(vencido)));
  const otroSecreto = jwt.sign({ username: 'ana' }, 'x'.repeat(40), {
    algorithm: 'HS256', subject: '7', issuer: JWT_ISSUER, audience: JWT_AUDIENCE, jwtid: 'x', expiresIn: 60,
  });
  check('token firmado con otro secreto falla', lanza(() => verifyAccessToken(otroSecreto)));
  const otraAud = jwt.sign({ username: 'ana' }, process.env.JWT_SECRET as string, {
    algorithm: 'HS256', subject: '7', issuer: JWT_ISSUER, audience: 'otro', jwtid: 'x', expiresIn: 60,
  });
  check('token con audience ajena falla', lanza(() => verifyAccessToken(otraAud)));
  const sinFirma = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${pl}.`;
  check('token alg=none falla', lanza(() => verifyAccessToken(sinFirma)));
  check('extractBearerToken', extractBearerToken(`Bearer ${token}`) === token && extractBearerToken('Basic abc') === null);

  // --- resource-match ---
  check('/api/hitos/:id coincide con /api/hitos/42', pathMatches('/api/hitos/:id', '/api/hitos/42'));
  check('distinto número de segmentos no coincide', !pathMatches('/api/hitos/:id', '/api/hitos/42/x'));
  check('deny by default', !isOperationGranted([{ method: 'GET', path: '/api/hitos' }], 'DELETE', '/api/hitos'));

  console.log(fallos === 0 ? '\nTODO OK' : `\n${fallos} comprobación(es) fallaron`);
  process.exit(fallos === 0 ? 0 : 1);
}

void main();
