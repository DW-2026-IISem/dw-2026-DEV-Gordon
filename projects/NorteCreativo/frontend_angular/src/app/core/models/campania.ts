import { Status, Timestamps } from './api';

export interface Campania extends Timestamps {
  id: number;
  cliente_id: number;
  nombre: string;
  descripcion: string | null;
  status: Status;
}

export interface CampaniaPayload {
  cliente_id: number;
  nombre: string;
  descripcion?: string | null;
}
