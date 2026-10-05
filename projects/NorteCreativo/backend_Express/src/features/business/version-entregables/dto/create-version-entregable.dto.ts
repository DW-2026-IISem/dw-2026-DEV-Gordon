import { pickFields } from '../../../../shared/http/pick-fields';
import { STATUS_VERSION } from '../version-entregable.model';

export const CAMPOS_VERSION = ['fecha_inicio', 'fecha_fin', 'total', 'observaciones', 'status'] as const;
// entregable_id solo se fija al crear (en PUT/PATCH solo se admite el mismo valor).
export const CAMPO_ENTREGABLE = 'entregable_id' as const;
// No son editables por HTTP: el DTO los conserva solo para que el service los rechace (400).
export const CAMPOS_DEL_SISTEMA = ['estado', 'numero_version'] as const;

export interface CreateVersionEntregableDto {
  entregable_id: number;
  fecha_inicio?: Date | string | null;
  fecha_fin?: Date | string | null;
  total?: number | null;
  observaciones?: string | null;
  status?: (typeof STATUS_VERSION)[number];
  // Tipados never: el service responde 400 si llegan en el body.
  estado?: never;
  numero_version?: never;
}

export const CAMPOS_ENTRADA = [CAMPO_ENTREGABLE, ...CAMPOS_VERSION, ...CAMPOS_DEL_SISTEMA] as const;

export const toCreateVersionEntregableDto = (body: unknown): CreateVersionEntregableDto =>
  pickFields(body, CAMPOS_ENTRADA) as unknown as CreateVersionEntregableDto;
