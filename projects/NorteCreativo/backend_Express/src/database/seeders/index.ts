import { sequelize, testConnection } from '../db';
import { seedClientes } from '../../features/business/cliente/cliente.seeder';
import { seedCampanias } from '../../features/business/campania/campania.seeder';
import '../../features/business/campania/campania.associations';
import { getSeedCounts } from './counts';

export class SeedersRunner {
  static async run(): Promise<void> {
    const counts = getSeedCounts();

    if (!(await testConnection())) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    try {
      await sequelize.sync();
      await seedClientes(counts.clientes);
      await seedCampanias(counts.campanias);
      console.log('Seeders finalizados');
    } finally {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  SeedersRunner.run().catch((error) => {
    console.error('Error ejecutando seeders:', error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
