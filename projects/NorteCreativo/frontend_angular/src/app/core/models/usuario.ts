import { Status, Timestamps } from './api';

// En lectura el backend no devuelve password.
export interface Usuario extends Timestamps {
  id: number;
  username: string;
  email: string;
  status: Status;
}

export interface UsuarioPayload {
  username: string;
  email: string;
  password: string;
}
