import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class CampaniaNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Campaña con id ${id} no fue encontrada`);
  }
}
