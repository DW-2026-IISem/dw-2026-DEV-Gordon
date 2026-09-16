import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class EntregableNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Entregable con id ${id} no encontrado`);
  }
}
