import { fakerES as faker } from '@faker-js/faker';
import { Cliente } from '../clientes/cliente.model';
import { Campania } from './campania.model';

export async function seedCampanias(count: number): Promise<number> {
  if ((await Campania.count()) > 0) {
    console.log('Campañas: la tabla ya tiene datos, se omite el seeder');
    return 0;
  }

  const clientes = await Cliente.findAll({ where: { status: 'active' }, attributes: ['id'] });
  if (clientes.length === 0) {
    console.log('Campañas: no hay clientes activos, se omite el seeder');
    return 0;
  }

  const campanias = Array.from({ length: count }, () => ({
    cliente_id: faker.helpers.arrayElement(clientes).id,
    nombre: `Campaña ${faker.commerce.productAdjective()} ${faker.date.future().getFullYear()}`,
    descripcion: faker.lorem.sentence(),
    status: 'active' as const,
  }));

  const creadas = await Campania.bulkCreate(campanias, { validate: true });
  console.log(`Campañas: ${creadas.length} registros insertados`);
  return creadas.length;
}
