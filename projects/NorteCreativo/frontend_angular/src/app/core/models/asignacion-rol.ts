import { Status, Timestamps } from './api';

export interface AsignacionRol extends Timestamps {
  id: number;
  user_id: number;
  role_id: number;
  status: Status;
}

export interface AsignacionRolPayload {
  user_id: number;
  role_id: number;
}
