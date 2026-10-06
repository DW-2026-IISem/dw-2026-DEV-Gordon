import { withTransaction } from '../../../shared/database/with-transaction';
import { ResourceRole } from '../resource-roles/resource-role.model';
import { RESOURCE_CATALOG } from './resource-catalog';
import { Resource } from './resource.model';

const clave = (method: string, path: string): string => `${method} ${path}`;

// Reconciliador determinista e idempotente: deja la tabla resources exactamente igual a RESOURCE_CATALOG.
//  - falta -> se crea; inactivo -> se reactiva; descripción distinta -> se corrige
//  - (method, path) que ya no está en el catálogo -> se ELIMINA junto con sus concesiones (resource_roles),
//    en una sola transacción y en ese orden por la FK RESTRICT. Reejecutar no cambia nada.
export async function seedResources(): Promise<number> {
  let nuevos = 0;
  for (const entrada of RESOURCE_CATALOG) {
    const [resource, creado] = await Resource.findOrCreate({
      where: { method: entrada.method, path: entrada.path },
      defaults: { ...entrada, status: 'active' },
    });
    if (creado) {
      nuevos++;
    } else if (resource.status !== 'active' || resource.description !== entrada.description) {
      await resource.update({ status: 'active', description: entrada.description });
    }
  }

  const enCatalogo = new Set(RESOURCE_CATALOG.map((r) => clave(r.method, r.path)));
  const obsoletos = (await Resource.findAll()).filter((r) => !enCatalogo.has(clave(r.method, r.path)));
  if (obsoletos.length > 0) {
    const ids = obsoletos.map((r) => r.id);
    await withTransaction(async (transaction) => {
      await ResourceRole.destroy({ where: { resource_id: ids }, transaction });
      await Resource.destroy({ where: { id: ids }, transaction });
    });
  }

  console.log(
    `Recursos: catálogo reconciliado (${RESOURCE_CATALOG.length} recursos, ${nuevos} nuevos, ${obsoletos.length} obsoletos eliminados)`
  );
  return nuevos;
}
