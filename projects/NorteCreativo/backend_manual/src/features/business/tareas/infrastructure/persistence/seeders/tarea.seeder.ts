import { Inject, Injectable, Logger } from "@nestjs/common";
import { HITO_REPOSITORY } from '../../../../hitos/domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../../../hitos/domain/interfaces/hito.repository.js';
import { Tarea } from '../../../domain/entities/tarea.entity.js';
import { TAREA_REPOSITORY } from '../../../domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../../domain/interfaces/tarea.repository.js';

@Injectable()
export class TareaSeeder {
  private readonly logger = new Logger(TareaSeeder.name);

  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: hitos } = await this.hitoRepo.findAll(1, 100);
    const hito = hitos.find((h) => h.estaAbierto());
    if (!hito || hito.id === null) {
      this.logger.warn('Seeder tareas: sin hito abierto; no se siembra');
      return;
    }
    const tareasDelHito = await this.tareaRepo.findByHitoId(hito.id);
    if (tareasDelHito.some((t) => t.nombre === 'Diseñar post de Instagram')) {
      this.logger.log('Seeder tareas: ya existía la tarea demo (idempotente)');
      return;
    }
    await this.tareaRepo.create(
      new Tarea({
        hitoId: hito.id,
        nombre: 'Diseñar post de Instagram',
        descripcion: 'Formato cuadrado, paleta de colores del carnaval',
        isActive: true,
      }),
    );
    this.logger.log('Seeder tareas: tarea demo creada');
  }
}
