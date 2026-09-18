import { Inject, Injectable } from '@nestjs/common';
import type { Campania } from '../../domain/entities/campania.entity.js';
import { CAMPANIA_REPOSITORY, type ICampaniaRepository } from '../../domain/interfaces/campania-repository.interface.js';

@Injectable()
export class ListCampaniasUseCase {
  constructor(@Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepository: ICampaniaRepository) {}

  async execute(): Promise<Campania[]> {
    return this.campaniaRepository.findAll();
  }
}
