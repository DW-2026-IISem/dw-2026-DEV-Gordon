import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_ENTRADA, CreateVersionEntregableDto } from './create-version-entregable.dto';

// PUT reemplaza los campos editables; entregable_id, si llega, debe ser el mismo.
export type UpdateVersionEntregableDto = Partial<CreateVersionEntregableDto>;

export const toUpdateVersionEntregableDto = (body: unknown): UpdateVersionEntregableDto =>
  pickFields(body, CAMPOS_ENTRADA) as UpdateVersionEntregableDto;
