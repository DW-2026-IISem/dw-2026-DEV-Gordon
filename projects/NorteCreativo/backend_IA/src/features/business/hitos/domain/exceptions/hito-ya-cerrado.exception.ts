import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

/**
 * RN-06: solo un hito ABIERTO puede cerrarse.
 */
export class HitoYaCerradoException extends BusinessRuleException {
  constructor(id: number) {
    super(`El hito con id ${id} ya no está ABIERTO y no puede cerrarse de nuevo`);
  }
}
