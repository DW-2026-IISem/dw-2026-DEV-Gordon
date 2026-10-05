import { sequelize, testConnection } from '../db';
import { seedClientes } from '../../features/business/clientes/cliente.seeder';
import { seedCampanias } from '../../features/business/campanias/campania.seeder';
import { seedHitos } from '../../features/business/hitos/hito.seeder';
import { seedTareas } from '../../features/business/tareas/tarea.seeder';
import { seedEntregables } from '../../features/business/entregables/entregable.seeder';
import { seedVersionEntregables } from '../../features/business/version-entregables/version-entregable.seeder';
import { seedUsers } from '../../features/auth/users/users.seeder';
import { seedRoles } from '../../features/auth/roles/roles.seeder';
import { seedResources } from '../../features/auth/resources/resources.seeder';
import '../../features/auth/users/user.model';
import '../../features/auth/roles/role.model';
import '../../features/auth/resources/resource.model';
import '../../features/auth/role-users/role-user.model';
import '../../features/auth/resource-roles/resource-role.model';
import '../../features/auth/refresh-tokens/refresh-token.model';
import '../../features/auth/rbac.associations';
import '../../features/business/campanias/campania.associations';
import '../../features/business/hitos/hito.associations';
import '../../features/business/tareas/tarea.associations';
import '../../features/business/entregables/entregable.associations';
import '../../features/business/version-entregables/version-entregable.associations';
import '../../features/business/aprobaciones/aprobacion.associations';
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
      await seedHitos(counts.hitos);
      await seedTareas(counts.tareas);
      await seedEntregables(counts.entregables);
      await seedVersionEntregables();
      await seedUsers();
      await seedRoles();
      await seedResources();
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
