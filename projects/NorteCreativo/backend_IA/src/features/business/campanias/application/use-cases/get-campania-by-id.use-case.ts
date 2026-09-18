import { Inject, Injectable } from '@nestjs/common';
import type { Campania } from '../../domain/entities/campania.entity.js';
import { CampaniaNotFoundException } from '../../domain/exceptions/campania-not-found.exception.js';
import { CAMPANIA_REPOSITORY, type ICampaniaRepository } from '../../domain/interfaces/campania-repository.interface.js';

@Injectable()
export class GetCampaniaByIdUseCase {
  constructor(@Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepository: ICampaniaRepository) {}

  async execute(id: number): Promise<Campania> {
    const campania = await this.campaniaRepository.findById(id);

    if (!campania) {
      throw new CampaniaNotFoundException(id);
    }

    return campania;
  }
}
