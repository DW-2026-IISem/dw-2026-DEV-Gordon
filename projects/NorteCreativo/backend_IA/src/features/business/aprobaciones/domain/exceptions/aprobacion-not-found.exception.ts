import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class AprobacionNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Aprobación con id ${id} no fue encontrada`);
  }
}
