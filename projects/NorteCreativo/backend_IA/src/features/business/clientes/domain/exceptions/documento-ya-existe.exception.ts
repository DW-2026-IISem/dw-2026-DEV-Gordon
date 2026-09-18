import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class DocumentoYaExisteException extends BusinessRuleException {
  constructor(numeroDocumento: string) {
    super(`Ya existe un cliente con el número de documento "${numeroDocumento}"`);
  }
}
