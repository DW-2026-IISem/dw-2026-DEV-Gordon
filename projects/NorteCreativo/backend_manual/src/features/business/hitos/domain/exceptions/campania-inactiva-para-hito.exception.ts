import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class CampaniaInactivaParaHitoException extends BusinessRuleException {
  constructor(campaniaId: number) {
    // RN-08
    super(`La campaña ${campaniaId} está inactiva; no admite hitos nuevos`);
  }
}
