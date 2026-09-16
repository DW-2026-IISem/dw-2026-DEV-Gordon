import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class VersionNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Versión de entregable con id ${id} no encontrada`);
  }
}
