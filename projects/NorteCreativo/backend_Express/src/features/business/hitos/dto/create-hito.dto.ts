import { pickFields } from '../../../../shared/http/pick-fields';
import { STATUS_HITO } from '../hito.model';

export const CAMPOS_HITO = ['campania_id', 'nombre', 'descripcion', 'status'] as const;
// No son editables por HTTP: el DTO los conserva solo para que el service los rechace (400).
export const CAMPOS_DE_CIERRE = ['estado', 'fecha_cierre'] as const;

export interface CreateHitoDto {
  campania_id: number;
  nombre: string;
  descripcion?: string | null;
  status?: (typeof STATUS_HITO)[number];
  // Tipados never: el service responde 400 si llegan en el body.
  estado?: never;
  fecha_cierre?: never;
}

export const toCreateHitoDto = (body: unknown): CreateHitoDto =>
  pickFields(body, [...CAMPOS_HITO, ...CAMPOS_DE_CIERRE]) as unknown as CreateHitoDto;
