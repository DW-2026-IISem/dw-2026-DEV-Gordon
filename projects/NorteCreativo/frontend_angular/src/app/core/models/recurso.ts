import { HttpMethod, Status, Timestamps } from './api';

export interface Recurso extends Timestamps {
  id: number;
  method: HttpMethod;
  path: string;
  description: string | null;
  status: Status;
}

export interface RecursoPayload {
  method: HttpMethod;
  path: string;
  description?: string | null;
}
