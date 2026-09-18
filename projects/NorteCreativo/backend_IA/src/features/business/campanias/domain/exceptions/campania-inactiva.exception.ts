import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

/**
 * Aún no se usa en ISS-04 (no hay AC que lo dispare); queda lista para que
 * ISS-05 (hitos) la lance si intentan crear un hito sobre una campaña
 * inactiva (`isActive === false`).
 */
export class CampaniaInactivaException extends BusinessRuleException {
  constructor(id: number) {
    super(`La campaña con id ${id} está inactiva`);
  }
}
