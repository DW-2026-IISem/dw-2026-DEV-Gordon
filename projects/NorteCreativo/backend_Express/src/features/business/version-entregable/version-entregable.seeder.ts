import { fakerES as faker } from '@faker-js/faker';
import { Entregable } from '../entregable/entregable.model';
import { VersionEntregable } from './version-entregable.model';

// Crea la versión 1 (EN_REVISION) de cada entregable que aún no tenga versiones.
export async function seedVersionEntregables(): Promise<number> {
  const entregables = await Entregable.findAll();
  if (entregables.length === 0) {
    console.log('Versiones de entregable: no hay entregables, se omite el seeder');
    return 0;
  }

  const conVersiones = new Set(
    (await VersionEntregable.findAll({ attributes: ['entregable_id'] })).map((v) => v.entregable_id)
  );
  const pendientes = entregables.filter((e) => !conVersiones.has(e.id));
  if (pendientes.length === 0) {
    console.log('Versiones de entregable: todos los entregables ya tienen versión, se omite el seeder');
    return 0;
  }

  const versiones = pendientes.map((e) => ({
    entregable_id: e.id,
    numero_version: 1,
    fecha_inicio: e.fecha_inicio,
    fecha_fin: e.fecha_fin,
    total: e.total,
    estado: 'EN_REVISION' as const,
    observaciones: faker.lorem.sentence(),
    status: 'active' as const,
  }));

  const creadas = await VersionEntregable.bulkCreate(versiones, { validate: true });
  console.log(`Versiones de entregable: ${creadas.length} registros insertados`);
  return creadas.length;
}
