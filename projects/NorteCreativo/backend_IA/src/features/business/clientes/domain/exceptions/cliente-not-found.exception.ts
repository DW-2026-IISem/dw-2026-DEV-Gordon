import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class ClienteNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Cliente con id ${id} no fue encontrado`);
  }
}
