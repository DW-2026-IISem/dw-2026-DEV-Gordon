import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

/**
 * RN-08: una campaña inactiva no admite hitos nuevos.
 */
export class CampaniaInactivaParaHitoException extends BusinessRuleException {
  constructor(campaniaId: number) {
    super(`La campaña con id ${campaniaId} está inactiva y no admite hitos nuevos`);
  }
}
