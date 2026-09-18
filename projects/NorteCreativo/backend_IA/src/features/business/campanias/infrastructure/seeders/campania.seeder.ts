import { Injectable, Logger } from '@nestjs/common';
import { ClienteModel } from '../../../clientes/infrastructure/models/cliente.model.js';
import { CLIENTE_DEMO_NUMERO_DOCUMENTO } from '../../../clientes/infrastructure/seeders/cliente.seeder.js';
import { CampaniaModel } from '../models/campania.model.js';

export const CAMPANIA_DEMO_NOMBRE = 'Carnaval 2026';

@Injectable()
export class CampaniaSeeder {
  private readonly logger = new Logger(CampaniaSeeder.name);

  /**
   * Lo invoca `SeedersRunner` después de `ClienteSeeder.seed()`, así que el
   * cliente demo ya existe cuando esto corre.
   */
  async seed(): Promise<void> {
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
