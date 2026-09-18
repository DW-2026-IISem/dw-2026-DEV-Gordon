import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class VersionNoEncontradaException extends EntityNotFoundException {
  constructor(versionEntregableId: number) {
    super(`Versión de entregable con id ${versionEntregableId} no fue encontrada`);
  }
}
