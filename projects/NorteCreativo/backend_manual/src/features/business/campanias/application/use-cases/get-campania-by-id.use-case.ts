import { Inject, Injectable } from '@nestjs/common';
import { CampaniaNotFoundException } from '../../domain/exceptions/campania-not-found.exception.js';
import { CAMPANIA_REPOSITORY } from '../../domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../domain/interfaces/campania.repository.js';
import type { Campania } from '../../domain/entities/campania.entity.js';

@Injectable()
export class GetCampaniaByIdUseCase {
  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
  ) {}

  async execute(id: number): Promise<Campania> {
    const campania = await this.campaniaRepo.findById(id);
    if (!campania) {
      throw new CampaniaNotFoundException(id);
    }
    return campania;
  }
}
