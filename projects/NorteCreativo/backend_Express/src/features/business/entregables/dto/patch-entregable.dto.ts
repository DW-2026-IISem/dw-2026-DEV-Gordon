import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_ENTREGABLE, CreateEntregableDto } from './create-entregable.dto';

export type PatchEntregableDto = Partial<CreateEntregableDto>;

export const toPatchEntregableDto = (body: unknown): PatchEntregableDto => pickFields(body, CAMPOS_ENTREGABLE) as PatchEntregableDto;
