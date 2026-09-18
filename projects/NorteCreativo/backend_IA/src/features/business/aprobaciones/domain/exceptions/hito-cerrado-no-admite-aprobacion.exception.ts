import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

/**
 * RN-06: un hito que no está ABIERTO no admite nuevas aprobaciones.
 */
export class HitoCerradoNoAdmiteAprobacionException extends BusinessRuleException {
  constructor(hitoId: number) {
    super(`El hito con id ${hitoId} no está ABIERTO y no admite nuevas aprobaciones`);
  }
}
