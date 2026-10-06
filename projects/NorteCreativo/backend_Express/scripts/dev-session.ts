// SOLO PARA PRUEBAS LOCALES (el login llega en ISS-20): crea una sesión de prueba (refresh token) para un usuario.
// Uso: npx ts-node scripts/dev-session.ts <username> [cuántas]      p. ej.  npx ts-node scripts/dev-session.ts finanzas 3
// Imprime el refresh token en claro (solo se muestra aquí; en la base queda únicamente su SHA-256).
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { sequelize } from '../src/database/db';
import { RefreshTokensService } from '../src/features/auth/refresh-tokens/refresh-tokens.service';
import { sha256Hex } from '../src/shared/auth/password';
import { User } from '../src/features/auth/users/user.model';

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev-session.ts es solo para desarrollo: no se ejecuta con NODE_ENV=production');
  }
  const username = process.argv[2]?.trim().toLowerCase();
  const cuantas = Number(process.argv[3] ?? 1);
  if (!username) throw new Error('Uso: npx ts-node scripts/dev-session.ts <username> [cuántas]');
  if (!Number.isInteger(cuantas) || cuantas < 1 || cuantas > 20) throw new Error('cuántas debe ser un entero entre 1 y 20');

  const user = await User.findOne({ where: { username }, attributes: ['id', 'username', 'status'] });
  if (!user) throw new Error(`No existe el usuario "${username}" (¿corriste npm run db:seed?)`);
  if (user.status !== 'active') throw new Error(`El usuario "${username}" está inactivo`);

  const service = new RefreshTokensService();
  for (let i = 1; i <= cuantas; i++) {
    const s = await service.issue(user.id, 'dev-session');
    console.log(`--- sesión ${i}/${cuantas} de "${user.username}" (user_id ${user.id})`);
    console.log(`sesion_id:     ${s.sessionId}`);
    console.log(`family_id:     ${s.familyId}`);
    console.log(`expira:        ${s.expiresAt.toISOString()}`);
    console.log(`refresh_token: ${s.rawToken}   <- solo se muestra ahora`);
    console.log(`hash en la BD: ${sha256Hex(s.rawToken)}`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
