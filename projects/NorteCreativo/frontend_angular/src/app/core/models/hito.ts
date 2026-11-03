import { Status, Timestamps } from './api';

export type EstadoHito = 'ABIERTO' | 'CERRADO' | 'FACTURADO';

export interface Hito extends Timestamps {
  id: number;
  campania_id: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoHito;
  fecha_cierre: string | null;
  status: Status;
}

// El estado y la fecha de cierre los pone el backend (cierre por aprobación).
export interface HitoPayload {
  campania_id: number;
  nombre: string;
  descripcion?: string | null;
}
