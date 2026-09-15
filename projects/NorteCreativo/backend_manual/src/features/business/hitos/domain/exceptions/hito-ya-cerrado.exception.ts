import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class HitoYaCerradoException extends BusinessRuleException {
  constructor(hitoId: number | null) {
    // RN-06: un hito cerrado no se reabre ni admite nuevas versiones/aprobaciones
    super(`El hito ${hitoId ?? '(desconocido)'} ya está cerrado`);
  }
}
