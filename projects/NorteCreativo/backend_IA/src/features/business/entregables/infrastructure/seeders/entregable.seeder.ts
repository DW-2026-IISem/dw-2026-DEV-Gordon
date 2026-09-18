import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { TareaModel } from '../../../tareas/infrastructure/models/tarea.model.js';
import { TAREA_DEMO_NOMBRE } from '../../../tareas/infrastructure/seeders/tarea.seeder.js';
import { EntregableModel } from '../models/entregable.model.js';

const ENTREGABLE_DEMO_OBSERVACIONES = 'Primer avance para revisión interna';

@Injectable()
export class EntregableSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(EntregableSeeder.name);

  /**
   * Se registra después de `TareaSeeder` en `BusinessModule`/`TareasModule`, y
   * Nest ejecuta los hooks `onApplicationBootstrap` en ese mismo orden de
   * registro (uno a la vez, esperando cada uno), así que la tarea demo ya
   * existe cuando esto corre.
   */
  async onApplicationBootstrap(): Promise<void> {
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
