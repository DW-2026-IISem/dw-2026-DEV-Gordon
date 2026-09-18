import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class TareaNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Tarea con id ${id} no fue encontrada`);
  }
}
