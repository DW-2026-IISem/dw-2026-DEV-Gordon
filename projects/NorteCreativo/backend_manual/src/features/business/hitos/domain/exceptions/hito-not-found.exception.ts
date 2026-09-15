import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class HitoNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Hito con id ${id} no encontrado`);
  }
}
