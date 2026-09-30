import { fakerES as faker } from '@faker-js/faker';
import { Campania } from '../campania/campania.model';
import { Hito } from './hito.model';

export async function seedHitos(count: number): Promise<number> {
  if ((await Hito.count()) > 0) {
    console.log('Hitos: la tabla ya tiene datos, se omite el seeder');
    return 0;
  }

  const campanias = await Campania.findAll({ where: { status: 'active' }, attributes: ['id'] });
  if (campanias.length === 0) {
    console.log('Hitos: no hay campañas activas, se omite el seeder');
    return 0;
  }

  const hitos = Array.from({ length: count }, () => ({
    campania_id: faker.helpers.arrayElement(campanias).id,
    nombre: `Hito ${faker.word.adjective()} ${faker.word.noun()}`,
    descripcion: faker.lorem.sentence(),
    estado: 'ABIERTO' as const,
    fecha_cierre: null,
    status: 'active' as const,
  }));

  const creados = await Hito.bulkCreate(hitos, { validate: true });
  console.log(`Hitos: ${creados.length} registros insertados`);
  return creados.length;
}
