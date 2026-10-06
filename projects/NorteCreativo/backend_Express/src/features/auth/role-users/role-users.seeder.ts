import { Role } from '../roles/role.model';
import { User } from '../users/user.model';
import { RoleUser } from './role-user.model';

// Cada usuario de laboratorio recibe su rol (uno por usuario).
export const ASIGNACIONES_LAB = [
  { username: 'admin', role: 'ADMIN' },
  { username: 'cuentas', role: 'CUENTAS' },
  { username: 'creativo', role: 'CREATIVO' },
  { username: 'aprobador', role: 'CLIENTE_APROBADOR' },
  { username: 'finanzas', role: 'FINANZAS' },
] as const;

// Idempotente: findOrCreate por (user_id, role_id); si la fila existía inactiva se reactiva, nunca se duplica.
export async function seedRoleUsers(): Promise<number> {
  let nuevas = 0;
  for (const { username, role: roleName } of ASIGNACIONES_LAB) {
    const user = await User.findOne({ where: { username } });
    const role = await Role.findOne({ where: { name: roleName } });
    if (!user || !role) throw new Error(`Asignaciones: faltan el usuario "${username}" o el rol "${roleName}" (¿se sembraron antes?)`);
    const [asignacion, creada] = await RoleUser.findOrCreate({
      where: { user_id: user.id, role_id: role.id },
      defaults: { user_id: user.id, role_id: role.id, status: 'active' },
    });
    if (creada) nuevas++;
    else if (asignacion.status !== 'active') await asignacion.update({ status: 'active' });
  }
  console.log(`Asignaciones de rol: ${ASIGNACIONES_LAB.length} usuarios con su rol (${nuevas} nuevas)`);
  return nuevas;
}
