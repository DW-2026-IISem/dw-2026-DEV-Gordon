import { User } from './user.model';

// Usuarios de LABORATORIO (uno por rol de Norte Creativo). Las contraseñas están documentadas en el README
// y NO deben usarse fuera de un entorno de práctica. Los roles se asignan en role-users.seeder.ts (ISS-17).
const USUARIOS_LAB = [
  { username: 'admin', email: 'admin@norte-creativo.example', password: 'Admin123!' },
  { username: 'cuentas', email: 'cuentas@norte-creativo.example', password: 'Cuentas123!' },
  { username: 'creativo', email: 'creativo@norte-creativo.example', password: 'Creativo123!' },
  { username: 'aprobador', email: 'aprobador@norte-creativo.example', password: 'Aprobador123!' },
  { username: 'finanzas', email: 'finanzas@norte-creativo.example', password: 'Finanzas123!' },
] as const;

// Idempotente: findOrCreate por username. Un usuario existente no se rehashea; si quedó inactivo se reactiva.
export async function seedUsers(): Promise<number> {
  let creados = 0;
  for (const datos of USUARIOS_LAB) {
    const [user, creado] = await User.findOrCreate({
      where: { username: datos.username },
      defaults: { ...datos, status: 'active' },
    });
    if (creado) {
      creados++;
    } else if (user.status !== 'active') {
      await user.update({ status: 'active' });
    }
  }
  console.log(creados > 0 ? `Usuarios: ${creados} registros insertados` : 'Usuarios: ya existen los 5 de laboratorio, se omite');
  return creados;
}
