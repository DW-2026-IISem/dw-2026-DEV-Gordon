import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class VersionAprobadaInmutableException extends BusinessRuleException {
  constructor(versionId: number) {
    // RN-04: una versión aprobada no se puede modificar
    super(`La versión ${versionId} ya está APROBADA y no se puede modificar`);
  }
}
