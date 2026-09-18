import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

/**
 * RN-04: una versión APROBADA ya no se puede modificar. Aún no se usa en
 * ISS-06 (no hay AC ni endpoint de edición); queda lista para ISS-07.
 */
export class VersionAprobadaInmutableException extends BusinessRuleException {
  constructor(id: number) {
    super(`La versión de entregable con id ${id} está APROBADA y no se puede modificar`);
  }
}
