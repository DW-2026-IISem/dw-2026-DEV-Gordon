import { pickFields } from '../../../../shared/http/pick-fields';
import { STATUS_TAREA } from '../tarea.model';

export const CAMPOS_TAREA = ['hito_id', 'nombre', 'descripcion', 'status'] as const;

export interface CreateTareaDto {
  hito_id: number;
  nombre: string;
  descripcion?: string | null;
  status?: (typeof STATUS_TAREA)[number];
}

export const toCreateTareaDto = (body: unknown): CreateTareaDto => pickFields(body, CAMPOS_TAREA) as unknown as CreateTareaDto;
