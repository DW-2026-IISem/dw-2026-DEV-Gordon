import { Injectable, Logger } from '@nestjs/common';
import { HitoModel } from '../../../hitos/infrastructure/models/hito.model.js';
import { HITO_DEMO_NOMBRE } from '../../../hitos/infrastructure/seeders/hito.seeder.js';
import { TareaModel } from '../models/tarea.model.js';

export const TAREA_DEMO_NOMBRE = 'Diseñar arte para post de Instagram';

@Injectable()
export class TareaSeeder {
  private readonly logger = new Logger(TareaSeeder.name);

  /**
   * Lo invoca `SeedersRunner` después de `HitoSeeder.seed()`, así que el
   * hito demo ya existe cuando esto corre.
   */
  async seed(): Promise<void> {
    const hitoDemo = await HitoModel.findOne({
      where: { nombre: HITO_DEMO_NOMBRE },
    });

    if (!hitoDemo) {
      this.logger.warn('No se encontró el hito demo; se omite el seeder de tareas.');
      return;
    }

    const [, created] = await TareaModel.findOrCreate({
      where: { nombre: TAREA_DEMO_NOMBRE, hitoId: hitoDemo.id },
      defaults: {
        nombre: TAREA_DEMO_NOMBRE,
        hitoId: hitoDemo.id,
        descripcion: 'Formato 1080x1350, paleta de marca',
      },
    });

    if (created) {
      this.logger.log(`Tarea demo creada: ${TAREA_DEMO_NOMBRE} (hito #${hitoDemo.id})`);
    }
  }
}
