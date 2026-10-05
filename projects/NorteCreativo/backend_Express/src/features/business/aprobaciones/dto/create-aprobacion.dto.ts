import { pickFields } from '../../../../shared/http/pick-fields';
import { ESTADOS_APROBACION } from '../aprobacion.model';

export const CAMPOS_APROBACION = ['version_entregable_id', 'aprobador_id', 'estado', 'comentario'] as const;
// Un veredicto solo puede ser APROBADA o RECHAZADA (PENDIENTE existe en el modelo pero no se emite por HTTP).
export const VEREDICTOS = ['APROBADA', 'RECHAZADA'] as const;

export interface CreateAprobacionDto {
  version_entregable_id: number;
  aprobador_id: number;
  estado: (typeof ESTADOS_APROBACION)[number];
  comentario?: string | null;
}

// El service valida el contenido: aquí solo se filtran los campos permitidos.
export const toCreateAprobacionDto = (body: unknown): CreateAprobacionDto =>
  pickFields(body, CAMPOS_APROBACION) as unknown as CreateAprobacionDto;
