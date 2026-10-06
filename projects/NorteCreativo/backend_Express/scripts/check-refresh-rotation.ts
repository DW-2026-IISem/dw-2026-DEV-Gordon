// Evidencia de ISS-19: prueba emisión, rotación, detección de reuso, vencimiento y concurrencia de los refresh tokens.
// Uso: npx ts-node scripts/check-refresh-rotation.ts [username]     (por defecto: creativo)
// Crea sesiones con device_info = 'check-rotation' y las ELIMINA al terminar (no deja residuos).
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { sequelize } from '../src/database/db';
import { RefreshToken } from '../src/features/auth/refresh-tokens/refresh-token.model';
import { RefreshTokensService } from '../src/features/auth/refresh-tokens/refresh-tokens.service';
import { User } from '../src/features/auth/users/user.model';
import { sha256Hex } from '../src/shared/auth/password';

const DEVICE = 'check-rotation';
let fallos = 0;
const ok = (nombre: string, condicion: boolean, detalle = ''): void => {
  if (!condicion) fallos++;
  console.log(`${condicion ? 'OK  ' : 'FAIL'} ${nombre}${detalle ? ` -> ${detalle}` : ''}`);
};

async function main(): Promise<void> {
  const username = (process.argv[2] ?? 'creativo').trim().toLowerCase();
  const user = await User.findOne({ where: { username }, attributes: ['id'] });
  if (!user) throw new Error(`No existe el usuario "${username}" (¿corriste npm run db:seed?)`);
  const service = new RefreshTokensService();

  try {
    const a = await service.issue(user.id, DEVICE);
    ok('issue: token opaco largo y familia (uuid)', a.rawToken.length >= 80 && a.familyId.length === 36);
    const fila = await RefreshToken.findByPk(a.sessionId);
    ok('issue: en la base solo el hash SHA-256', fila!.token_hash === sha256Hex(a.rawToken) && fila!.token_hash !== a.rawToken && fila!.status === 'active');

    const r1 = await service.rotate(a.rawToken);
    ok('rotate: rotated, misma familia y token distinto', r1.kind === 'rotated' && r1.familyId === a.familyId && r1.rawToken !== a.rawToken);
    const viejo = await RefreshToken.findByPk(a.sessionId);
    ok('rotate: el viejo queda inactive con revoked_at', viejo!.status === 'inactive' && viejo!.revoked_at !== null);
    if (r1.kind !== 'rotated') throw new Error('la rotación falló: no se puede seguir');
    const nuevo = await RefreshToken.findByPk(r1.sessionId);
    ok('rotate: el nuevo es otra fila y está active', nuevo!.status === 'active' && r1.sessionId !== a.sessionId);

    const reuso = await service.rotate(a.rawToken);
    ok('REUSO del token ya rotado: kind=reuse', reuso.kind === 'reuse', JSON.stringify(reuso));
    ok('REUSO: el token hijo (legítimo) también queda inactive', (await RefreshToken.findByPk(r1.sessionId))!.status === 'inactive');
    ok('REUSO: el hijo ya no puede rotar', (await service.rotate(r1.rawToken)).kind === 'reuse');

    ok('token desconocido -> invalid', (await service.rotate('token-que-no-existe')).kind === 'invalid');

    const b = await service.issue(user.id, DEVICE);
    await RefreshToken.update({ expires_at: new Date(Date.now() - 1000) }, { where: { id: b.sessionId } });
    ok('token vencido -> expired', (await service.rotate(b.rawToken)).kind === 'expired');
    ok('vencido: queda inactive', (await RefreshToken.findByPk(b.sessionId))!.status === 'inactive');

    const c = await service.issue(user.id, DEVICE);
    const [x, y] = await Promise.all([service.rotate(c.rawToken), service.rotate(c.rawToken)]);
    ok('concurrencia: dos rotaciones simultáneas no emiten dos tokens válidos', [x.kind, y.kind].sort().join('+') === 'reuse+rotated', `${x.kind}+${y.kind}`);
    ok('concurrencia: la familia no queda con tokens activos', (await RefreshToken.count({ where: { family_id: c.familyId, status: 'active' } })) === 0);

    const d = await service.issue(user.id, DEVICE);
    await service.revokeByToken(d.rawToken);
    ok('revokeByToken: revoca', (await RefreshToken.findByPk(d.sessionId))!.status === 'inactive');
    await service.revokeByToken('no-existe');
    ok('revokeByToken: un token desconocido no es error (idempotente)', true);
  } finally {
    const borradas = await RefreshToken.destroy({ where: { device_info: DEVICE } });
    console.log(`(limpieza: ${borradas} sesiones de prueba eliminadas)`);
  }
  console.log(fallos === 0 ? '\nTODO OK' : `\n${fallos} comprobación(es) fallaron`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .then(() => {
    if (fallos > 0) process.exitCode = 1;
  })
  .finally(() => sequelize.close());
