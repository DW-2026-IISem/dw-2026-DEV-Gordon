import { Inject, Injectable, Logger } from "@nestjs/common";
import { TAREA_REPOSITORY } from '../../../../tareas/domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../../../tareas/domain/interfaces/tarea.repository.js';
import { Entregable } from '../../../domain/entities/entregable.entity.js';
import { ENTREGABLE_REPOSITORY } from '../../../domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../../domain/interfaces/entregable.repository.js';

@Injectable()
export class EntregableSeeder {
  private readonly logger = new Logger(EntregableSeeder.name);

  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: tareas } = await this.tareaRepo.findAll(1, 100);
    const tarea = tareas[0];
    if (!tarea || tarea.id === null) {
      this.logger.warn('Seeder entregables: sin tarea demo; no se siembra');
      return;
    }
    const existentes = await this.entregableRepo.findByTareaId(tarea.id);
    if (existentes.length > 0) {
      this.logger.log('Seeder entregables: ya existía el entregable demo (idempotente)');
      return;
    }
    await this.entregableRepo.create(
      new Entregable({
        tareaId: tarea.id,
        fechaInicio: new Date(),
        observaciones: 'Primer borrador subido para revisión',
        estado: 'EN_PROCESO',
      }),
    );
    this.logger.log('Seeder entregables: entregable demo creado');
  }
}
