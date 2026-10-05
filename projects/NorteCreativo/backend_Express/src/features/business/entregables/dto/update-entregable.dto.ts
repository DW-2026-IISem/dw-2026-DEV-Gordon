import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_ENTREGABLE, CreateEntregableDto } from './create-entregable.dto';

// PUT reemplaza el recurso completo: tarea_id es obligatorio (lo valida el service).
export type UpdateEntregableDto = Partial<CreateEntregableDto>;

export const toUpdateEntregableDto = (body: unknown): UpdateEntregableDto => pickFields(body, CAMPOS_ENTREGABLE) as UpdateEntregableDto;
