import { Injectable, Logger } from '@nestjs/common';
import { TareaModel } from '../../../tareas/infrastructure/models/tarea.model.js';
import { TAREA_DEMO_NOMBRE } from '../../../tareas/infrastructure/seeders/tarea.seeder.js';
import { EntregableModel } from '../models/entregable.model.js';

const ENTREGABLE_DEMO_OBSERVACIONES = 'Primer avance para revisión interna';

@Injectable()
export class EntregableSeeder {
  private readonly logger = new Logger(EntregableSeeder.name);

  /**
   * Lo invoca `SeedersRunner` después de `TareaSeeder.seed()`, así que la
   * tarea demo ya existe cuando esto corre.
   */
  async seed(): Promise<void> {
    const tareaDemo = await TareaModel.findOne({
      where: { nombre: TAREA_DEMO_NOMBRE },
    });

    if (!tareaDemo) {
      this.logger.warn('No se encontró la tarea demo; se omite el seeder de entregables.');
      return;
    }

    const [, created] = await EntregableModel.findOrCreate({
      where: { tareaId: tareaDemo.id },
      defaults: {
        tareaId: tareaDemo.id,
        observaciones: ENTREGABLE_DEMO_OBSERVACIONES,
      },
    });

    if (created) {
      this.logger.log(`Entregable demo creado (tarea #${tareaDemo.id})`);
    }
  }
}
