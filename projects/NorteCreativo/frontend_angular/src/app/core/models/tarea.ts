import { Status, Timestamps } from './api';

export interface Tarea extends Timestamps {
  id: number;
  hito_id: number;
  nombre: string;
  descripcion: string | null;
  status: Status;
}

export interface TareaPayload {
  hito_id: number;
  nombre: string;
  descripcion?: string | null;
}
