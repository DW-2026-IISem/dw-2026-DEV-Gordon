import { Status, Timestamps } from './api';

export interface Rol extends Timestamps {
  id: number;
  name: string;
  description: string | null;
  status: Status;
}

export interface RolPayload {
  name: string;
  description?: string | null;
}
