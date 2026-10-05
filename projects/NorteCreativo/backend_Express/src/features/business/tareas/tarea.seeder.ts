import { fakerES as faker } from '@faker-js/faker';
import { Hito } from '../hitos/hito.model';
import { Tarea } from './tarea.model';

export async function seedTareas(count: number): Promise<number> {
  if ((await Tarea.count()) > 0) {
    console.log('Tareas: la tabla ya tiene datos, se omite el seeder');
    return 0;
  }

  const hitos = await Hito.findAll({ attributes: ['id'] });
  if (hitos.length === 0) {
    console.log('Tareas: no hay hitos, se omite el seeder');
    return 0;
  }

  const tareas = Array.from({ length: count }, () => ({
    hito_id: faker.helpers.arrayElement(hitos).id,
    nombre: `Tarea ${faker.word.verb()} ${faker.word.noun()}`,
    descripcion: faker.lorem.sentence(),
    status: 'active' as const,
  }));

  const creadas = await Tarea.bulkCreate(tareas, { validate: true });
  console.log(`Tareas: ${creadas.length} registros insertados`);
  return creadas.length;
}
