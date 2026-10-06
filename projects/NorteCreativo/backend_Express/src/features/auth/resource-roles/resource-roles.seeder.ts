import { Resource } from '../resources/resource.model';
import { Role } from '../roles/role.model';
import { SEED_ROLES } from '../roles/roles.seeder';
import { recursosDelRol } from './role-matrix';
import { ResourceRolesService } from './resource-roles.service';

// Cada rol recibe exactamente las concesiones de la matriz, vía reconcileRole (transaccional e idempotente):
// reejecutar no duplica filas y deja inactivo lo que ya no esté en la matriz.
export async function seedResourceRoles(service: ResourceRolesService = new ResourceRolesService()): Promise<number> {
  let total = 0;
  const resumen: string[] = [];
  for (const { name } of SEED_ROLES) {
    const role = await Role.findOne({ where: { name } });
    if (!role) throw new Error(`Concesiones: falta el rol "${name}" (¿se sembró antes?)`);

    const ids: number[] = [];
    for (const { method, path } of recursosDelRol(name)) {
      const resource = await Resource.findOne({ where: { method, path } });
      if (!resource) throw new Error(`Concesiones: falta el recurso ${method} ${path} (¿se sembró antes?)`);
      ids.push(resource.id);
    }

    const r = await service.reconcileRole(role.id, ids);
    total += r.total_active;
    resumen.push(`${name}=${r.total_active}`);
  }
  console.log(`Concesiones: matriz reconciliada (${resumen.join(', ')}; total ${total})`);
  return total;
}
