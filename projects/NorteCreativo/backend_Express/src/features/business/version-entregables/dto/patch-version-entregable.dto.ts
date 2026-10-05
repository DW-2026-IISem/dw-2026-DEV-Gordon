import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_ENTRADA, CreateVersionEntregableDto } from './create-version-entregable.dto';

export type PatchVersionEntregableDto = Partial<CreateVersionEntregableDto>;

export const toPatchVersionEntregableDto = (body: unknown): PatchVersionEntregableDto =>
  pickFields(body, CAMPOS_ENTRADA) as PatchVersionEntregableDto;
