import { pickFields } from '../../../../shared/http/pick-fields';
import { ESTADOS_APROBACION } from '../aprobacion.model';

// aprobador_id NO es un campo de entrada (RN-05): sale del usuario autenticado. Se conserva en el DTO solo para que el
// service lo rechace con 400 si alguien lo envía.
export const CAMPOS_APROBACION = ['version_entregable_id', 'estado', 'comentario', 'aprobador_id'] as const;
// Un veredicto solo puede ser APROBADA o RECHAZADA (PENDIENTE existe en el modelo pero no se emite por HTTP).
export const VEREDICTOS = ['APROBADA', 'RECHAZADA'] as const;

export interface CreateAprobacionDto {
  version_entregable_id: number;
  estado: (typeof ESTADOS_APROBACION)[number];
  comentario?: string | null;
  // Tipado never: si llega en el body el service responde 400.
  aprobador_id?: never;
}

// El service valida el contenido: aquí solo se filtran los campos permitidos.
export const toCreateAprobacionDto = (body: unknown): CreateAprobacionDto =>
  pickFields(body, CAMPOS_APROBACION) as unknown as CreateAprobacionDto;
