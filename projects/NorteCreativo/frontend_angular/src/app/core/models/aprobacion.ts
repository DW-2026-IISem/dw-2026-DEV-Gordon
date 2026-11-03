import { Status, Timestamps } from './api';

export type EstadoAprobacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface Aprobacion extends Timestamps {
  id: number;
  version_entregable_id: number;
  estado: EstadoAprobacion;
  aprobador_id: number;
  comentario: string | null;
  fecha: string;
  status: Status;
}

// aprobador_id nunca se envía: el backend lo toma del token (RN-05).
export interface AprobacionPayload {
  version_entregable_id: number;
  estado: EstadoAprobacion;
  comentario?: string | null;
}

export interface AprobacionResultado {
  aprobacion: Aprobacion;
  hito_cerrado: boolean;
  hito_id: number;
  fecha_cierre: string | null;
}
