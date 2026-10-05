import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_TAREA, CreateTareaDto } from './create-tarea.dto';

// PUT reemplaza el recurso completo: hito_id y nombre son obligatorios (los valida el service).
export type UpdateTareaDto = Partial<CreateTareaDto>;

export const toUpdateTareaDto = (body: unknown): UpdateTareaDto => pickFields(body, CAMPOS_TAREA) as UpdateTareaDto;
