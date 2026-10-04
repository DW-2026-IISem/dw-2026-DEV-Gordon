import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_CLIENTE, CreateClienteDto } from './create-cliente.dto';

// PUT reemplaza el recurso: tipo_documento, numero_documento y nombre son obligatorios.
export type UpdateClienteDto = Partial<CreateClienteDto>;

export const toUpdateClienteDto = (body: unknown): UpdateClienteDto => pickFields(body, CAMPOS_CLIENTE) as UpdateClienteDto;
