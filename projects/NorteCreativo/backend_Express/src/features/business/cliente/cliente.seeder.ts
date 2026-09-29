import { fakerES as faker } from '@faker-js/faker';
import { Cliente } from './cliente.model';

const documentoUnico = (usados: Set<string>, longitud: number): string => {
  let documento: string;
  do {
    documento = faker.string.numeric({ length: longitud, allowLeadingZeros: false });
  } while (usados.has(documento));
  usados.add(documento);
  return documento;
};

export async function seedClientes(count: number): Promise<number> {
  if ((await Cliente.count()) > 0) {
    console.log('Clientes: la tabla ya tiene datos, se omite el seeder');
    return 0;
  }

  const usados = new Set<string>();
  const clientes = Array.from({ length: count }, () => {
    const esEmpresa = faker.datatype.boolean({ probability: 0.7 });
    const nombre = esEmpresa ? faker.company.name() : faker.person.fullName();
    return {
      tipo_documento: esEmpresa ? ('NIT' as const) : ('CC' as const),
      numero_documento: documentoUnico(usados, esEmpresa ? 9 : 10),
      nombre,
      telefono: `3${faker.string.numeric(9)}`,
      email: faker.internet.email({ provider: 'example.com' }).toLowerCase(),
      status: 'active' as const,
    };
  });

  const creados = await Cliente.bulkCreate(clientes, { validate: true });
  console.log(`Clientes: ${creados.length} registros insertados`);
  return creados.length;
}
