import { fakerES as faker } from '@faker-js/faker';
import { Campania } from '../campanias/campania.model';
import { Presupuesto } from './presupuesto.model';

// Idempotente por campaña: solo siembra para las campañas activas que aún no tienen ningún presupuesto.
export async function seedPresupuestos(): Promise<number> {
  const campanias = await Campania.findAll({ where: { status: 'active' }, attributes: ['id'] });
  if (campanias.length === 0) {
    console.log('Presupuestos: no hay campañas activas, se omite el seeder');
    return 0;
  }

  const conPresupuesto = new Set((await Presupuesto.findAll({ attributes: ['campania_id'] })).map((p) => p.campania_id));
  const pendientes = campanias.filter((c) => !conPresupuesto.has(c.id));
  if (pendientes.length === 0) {
    console.log('Presupuestos: todas las campañas ya tienen presupuesto, se omite el seeder');
    return 0;
  }

  const creados = await Presupuesto.bulkCreate(
    pendientes.map((c) => ({
      campania_id: c.id,
      fecha: new Date(),
      valor: faker.number.int({ min: 5_000_000, max: 50_000_000 }),
      estado: 'APROBADO' as const,
      observaciones: 'Presupuesto inicial de la campaña (seed)',
      status: 'active' as const,
    })),
    { validate: true }
  );
  console.log(`Presupuestos: ${creados.length} registros insertados`);
  return creados.length;
}
