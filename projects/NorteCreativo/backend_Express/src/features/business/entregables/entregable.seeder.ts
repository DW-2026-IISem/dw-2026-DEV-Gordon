import { fakerES as faker } from '@faker-js/faker';
import { Tarea } from '../tareas/tarea.model';
import { Entregable } from './entregable.model';

export async function seedEntregables(count: number): Promise<number> {
  if ((await Entregable.count()) > 0) {
    console.log('Entregables: la tabla ya tiene datos, se omite el seeder');
    return 0;
  }

  const tareas = await Tarea.findAll({ attributes: ['id'] });
  if (tareas.length === 0) {
    console.log('Entregables: no hay tareas, se omite el seeder');
    return 0;
  }

  const entregables = Array.from({ length: count }, () => {
    const inicio = faker.date.recent({ days: 30 });
    return {
      tarea_id: faker.helpers.arrayElement(tareas).id,
      fecha_inicio: inicio,
      fecha_fin: faker.date.soon({ days: 30, refDate: inicio }),
      total: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
      estado: 'EN_PROCESO' as const,
      observaciones: faker.lorem.sentence(),
      status: 'active' as const,
    };
  });

  const creados = await Entregable.bulkCreate(entregables, { validate: true });
  console.log(`Entregables: ${creados.length} registros insertados`);
  return creados.length;
}
