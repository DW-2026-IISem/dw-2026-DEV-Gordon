import { Money, Status, Timestamps } from './api';

export type EstadoEntregable = 'EN_PROCESO' | 'ENTREGADO';

export interface Entregable extends Timestamps {
  id: number;
  tarea_id: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  total: Money | null;
  estado: EstadoEntregable;
  observaciones: string | null;
  status: Status;
}

export interface EntregablePayload {
  tarea_id: number;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  total?: number | null;
  estado?: EstadoEntregable;
  observaciones?: string | null;
}
