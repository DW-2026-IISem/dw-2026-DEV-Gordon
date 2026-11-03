import { Money, Status, Timestamps } from './api';

export type EstadoVersion = 'EN_REVISION' | 'APROBADA' | 'RECHAZADA';

export interface VersionEntregable extends Timestamps {
  id: number;
  entregable_id: number;
  numero_version: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  total: Money | null;
  estado: EstadoVersion;
  observaciones: string | null;
  status: Status;
}

// numero_version y estado los pone el backend.
export interface VersionEntregablePayload {
  entregable_id: number;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  total?: number | null;
  observaciones?: string | null;
}
