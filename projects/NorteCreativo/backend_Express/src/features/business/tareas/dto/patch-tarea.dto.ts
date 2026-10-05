import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_TAREA, CreateTareaDto } from './create-tarea.dto';

export type PatchTareaDto = Partial<CreateTareaDto>;

export const toPatchTareaDto = (body: unknown): PatchTareaDto => pickFields(body, CAMPOS_TAREA) as PatchTareaDto;
