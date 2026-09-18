import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { CampaniaModel } from '../../../campanias/infrastructure/models/campania.model.js';
import { CAMPANIA_DEMO_NOMBRE } from '../../../campanias/infrastructure/seeders/campania.seeder.js';
import { HitoModel } from '../models/hito.model.js';

const HITO_DEMO_NOMBRE = 'Diseño de piezas para redes';

@Injectable()
export class HitoSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(HitoSeeder.name);

  /**
   * Se registra después de `CampaniaSeeder` en `BusinessModule`/`CampaniasModule`,
   * y Nest ejecuta los hooks `onApplicationBootstrap` en ese mismo orden de
   * registro (uno a la vez, esperando cada uno), así que la campaña demo ya
   * existe cuando esto corre.
   */
  async onApplicationBootstrap(): Promise<void> {
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
