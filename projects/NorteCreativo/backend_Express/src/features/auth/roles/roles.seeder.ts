import { Role } from './role.model';

// Los 5 roles de Norte Creativo. Que exista un rol NO concede nada: los permisos son filas de resource_roles (ISS-17).
export const SEED_ROLES = [
  { name: 'ADMIN', description: 'Administra usuarios, roles, recursos y concesiones' },
  { name: 'CUENTAS', description: 'Gestiona clientes y campañas' },
  { name: 'CREATIVO', description: 'Trabaja hitos, tareas, entregables y sus versiones' },
  { name: 'CLIENTE_APROBADOR', description: 'Aprueba o rechaza versiones de entregables' },
  { name: 'FINANZAS', description: 'Consulta clientes, campañas y entregables' },
] as const;

// Reconciliador determinista e idempotente: crea los que faltan, reactiva los inactivos y corrige la descripción.
// Los roles que no están en el catálogo no se tocan (pueden tener usuarios o concesiones); solo se informan.
export async function seedRoles(): Promise<number> {
  let nuevos = 0;
  for (const datos of SEED_ROLES) {
    const [role, creado] = await Role.findOrCreate({ where: { name: datos.name }, defaults: { ...datos, status: 'active' } });
    if (creado) {
      nuevos++;
    } else if (role.status !== 'active' || role.description !== datos.description) {
      await role.update({ status: 'active', description: datos.description });
    }
  }
  const total = await Role.count();
  const fuera = total - SEED_ROLES.length;
  console.log(
    `Roles: catálogo reconciliado (${SEED_ROLES.length} roles, ${nuevos} nuevos)` +
      (fuera > 0 ? `; ${fuera} rol(es) fuera del catálogo sin tocar` : '')
  );
  return nuevos;
}
