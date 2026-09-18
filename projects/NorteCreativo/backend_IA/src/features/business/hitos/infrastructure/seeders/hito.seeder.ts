import { Injectable, Logger } from '@nestjs/common';
import { CampaniaModel } from '../../../campanias/infrastructure/models/campania.model.js';
import { CAMPANIA_DEMO_NOMBRE } from '../../../campanias/infrastructure/seeders/campania.seeder.js';
import { HitoModel } from '../models/hito.model.js';

export const HITO_DEMO_NOMBRE = 'Diseño de piezas para redes';

@Injectable()
export class HitoSeeder {
  private readonly logger = new Logger(HitoSeeder.name);

  /**
   * Lo invoca `SeedersRunner` después de `CampaniaSeeder.seed()`, así que la
   * campaña demo ya existe cuando esto corre.
   */
  async seed(): Promise<void> {
    const campaniaDemo = await CampaniaModel.findOne({
      where: { nombre: CAMPANIA_DEMO_NOMBRE },
    });

    if (!campaniaDemo) {
      this.logger.warn('No se encontró la campaña demo; se omite el seeder de hitos.');
      return;
    }

    const [, created] = await HitoModel.findOrCreate({
      where: { nombre: HITO_DEMO_NOMBRE, campaniaId: campaniaDemo.id },
      defaults: {
        nombre: HITO_DEMO_NOMBRE,
        campaniaId: campaniaDemo.id,
        descripcion: 'Piezas gráficas para Instagram y Facebook',
      },
    });

    if (created) {
      this.logger.log(`Hito demo creado: ${HITO_DEMO_NOMBRE} (campaña #${campaniaDemo.id})`);
    }
  }
}
