import { ApplicationException } from './application.exception.js';

export class EntityNotFoundException extends ApplicationException {
  constructor(message: string) {
    super(message, 404);
  }
}
