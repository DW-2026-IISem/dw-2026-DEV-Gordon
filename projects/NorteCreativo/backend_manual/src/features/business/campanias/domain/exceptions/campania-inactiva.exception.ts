import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class CampaniaInactivaException extends BusinessRuleException {
  constructor(campaniaId: number) {
    // RN-08: una campaña inactiva no admite hitos nuevos
    super(`La campaña con id ${campaniaId} está inactiva y no admite hitos nuevos`);
  }
}
