import { RESOURCE_CATALOG } from './resource-catalog';
import { Resource } from './resource.model';

// Reconciliador determinista e idempotente: recorre RESOURCE_CATALOG, crea los recursos que faltan, reactiva los
// inactivos y corrige la descripción. Los recursos que no están en el catálogo no se tocan (pueden tener
// concesiones); solo se informan.
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
  const total = await Resource.count();
  const fuera = total - RESOURCE_CATALOG.length;
  console.log(
    `Recursos: catálogo reconciliado (${RESOURCE_CATALOG.length} recursos, ${nuevos} nuevos)` +
      (fuera > 0 ? `; ${fuera} recurso(s) fuera del catálogo sin tocar` : '')
  );
  return nuevos;
}
