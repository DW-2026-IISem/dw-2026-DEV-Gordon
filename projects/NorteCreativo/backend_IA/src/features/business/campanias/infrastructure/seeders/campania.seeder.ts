import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ClienteModel } from '../../../clientes/infrastructure/models/cliente.model.js';
import { CLIENTE_DEMO_NUMERO_DOCUMENTO } from '../../../clientes/infrastructure/seeders/cliente.seeder.js';
import { CampaniaModel } from '../models/campania.model.js';

export const CAMPANIA_DEMO_NOMBRE = 'Carnaval 2026';

@Injectable()
export class CampaniaSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(CampaniaSeeder.name);

  /**
   * Se registra después de `ClienteSeeder` en `BusinessModule`/`ClientesModule`,
   * y Nest ejecuta los hooks `onApplicationBootstrap` en ese mismo orden de
   * registro (uno a la vez, esperando cada uno), así que el cliente demo ya
   * existe cuando esto corre.
   */
  async onApplicationBootstrap(): Promise<void> {
    const clienteDemo = await ClienteModel.findOne({
      where: { numeroDocumento: CLIENTE_DEMO_NUMERO_DOCUMENTO },
    });

    if (!clienteDemo) {
      this.logger.warn('No se encontró el cliente demo; se omite el seeder de campañas.');
      return;
    }

    const [, created] = await CampaniaModel.findOrCreate({
      where: { nombre: CAMPANIA_DEMO_NOMBRE, clienteId: clienteDemo.id },
      defaults: {
        nombre: CAMPANIA_DEMO_NOMBRE,
        clienteId: clienteDemo.id,
        descripcion: 'Campaña de temporada para el Carnaval 2026',
      },
    });

    if (created) {
      this.logger.log(`Campaña demo creada: ${CAMPANIA_DEMO_NOMBRE} (cliente #${clienteDemo.id})`);
    }
  }
}
