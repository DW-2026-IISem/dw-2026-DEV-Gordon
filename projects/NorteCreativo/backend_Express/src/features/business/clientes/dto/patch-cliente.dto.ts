import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_CLIENTE, CreateClienteDto } from './create-cliente.dto';

export type PatchClienteDto = Partial<CreateClienteDto>;

export const toPatchClienteDto = (body: unknown): PatchClienteDto => pickFields(body, CAMPOS_CLIENTE) as PatchClienteDto;
