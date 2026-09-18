import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { EntregableModel } from '../../../entregables/infrastructure/models/entregable.model.js';
import { TareaModel } from '../../../tareas/infrastructure/models/tarea.model.js';
import { TAREA_DEMO_NOMBRE } from '../../../tareas/infrastructure/seeders/tarea.seeder.js';
import { VersionEntregableModel } from '../models/version-entregable.model.js';

@Injectable()
export class VersionEntregableSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(VersionEntregableSeeder.name);

  /**
   * Se registra después de `EntregableSeeder` en `BusinessModule`/`EntregablesModule`,
   * y Nest ejecuta los hooks `onApplicationBootstrap` en ese mismo orden de
   * registro (uno a la vez, esperando cada uno), así que el entregable demo
   * ya existe cuando esto corre.
   */
  async onApplicationBootstrap(): Promise<void> {
    const tareaDemo = await TareaModel.findOne({ where: { nombre: TAREA_DEMO_NOMBRE } });

    if (!tareaDemo) {
      this.logger.warn('No se encontró la tarea demo; se omite el seeder de versiones de entregable.');
      return;
    }

    const entregableDemo = await EntregableModel.findOne({ where: { tareaId: tareaDemo.id } });

    if (!entregableDemo) {
      this.logger.warn('No se encontró el entregable demo; se omite el seeder de versiones de entregable.');
      return;
    }

    const [, created] = await VersionEntregableModel.findOrCreate({
      where: { entregableId: entregableDemo.id, numeroVersion: 1 },
      defaults: {
        entregableId: entregableDemo.id,
        numeroVersion: 1,
        observaciones: 'Primera versión entregada para revisión',
      },
    });

    if (created) {
      this.logger.log(`Versión demo creada: v1 (entregable #${entregableDemo.id})`);
    }
  }
}
