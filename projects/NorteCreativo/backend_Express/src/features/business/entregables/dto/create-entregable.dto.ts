import { pickFields } from '../../../../shared/http/pick-fields';
import { ESTADOS_ENTREGABLE, STATUS_ENTREGABLE } from '../entregable.model';

export const CAMPOS_ENTREGABLE = ['tarea_id', 'fecha_inicio', 'fecha_fin', 'total', 'estado', 'observaciones', 'status'] as const;

export interface CreateEntregableDto {
  tarea_id: number;
  fecha_inicio?: Date | string | null;
  fecha_fin?: Date | string | null;
  total?: number | null;
  estado?: (typeof ESTADOS_ENTREGABLE)[number];
  observaciones?: string | null;
  status?: (typeof STATUS_ENTREGABLE)[number];
}

export const toCreateEntregableDto = (body: unknown): CreateEntregableDto =>
  pickFields(body, CAMPOS_ENTREGABLE) as unknown as CreateEntregableDto;
