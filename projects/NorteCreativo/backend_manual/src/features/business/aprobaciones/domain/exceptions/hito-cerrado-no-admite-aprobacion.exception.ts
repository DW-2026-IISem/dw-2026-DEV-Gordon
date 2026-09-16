import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class HitoCerradoNoAdmiteAprobacionException extends BusinessRuleException {
  constructor(hitoId: number) {
    // RN-06: un hito cerrado no admite nuevas versiones ni aprobaciones
    super(`El hito ${hitoId} ya está cerrado y no admite nuevas aprobaciones`);
  }
}
