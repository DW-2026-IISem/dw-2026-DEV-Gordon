// SOLO PARA PRUEBAS LOCALES: imprime un access token válido para un username existente y activo.
// Uso: npx ts-node scripts/dev-token.ts admin
// El secreto se lee del .env (JWT_SECRET); el token sale por stdout y los errores por stderr.
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { sequelize } from '../src/database/db';
import { User } from '../src/features/auth/users/user.model';
import { signAccessToken } from '../src/shared/auth/jwt';

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev-token.ts es solo para desarrollo: no se ejecuta con NODE_ENV=production');
  }
  const username = process.argv[2]?.trim().toLowerCase();
  if (!username) throw new Error('Uso: npx ts-node scripts/dev-token.ts <username>   (admin, cuentas, creativo, aprobador, finanzas)');

  const user = await User.findOne({ where: { username }, attributes: ['id', 'username', 'status'] });
  if (!user) throw new Error(`No existe el usuario "${username}" (¿corriste npm run db:seed?)`);
  if (user.status !== 'active') throw new Error(`El usuario "${username}" está inactivo: authenticate lo rechazaría`);

  process.stdout.write(`${signAccessToken({ id: user.id, username: user.username })}\n`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
