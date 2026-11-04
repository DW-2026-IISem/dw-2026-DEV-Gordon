import { Status, Timestamps } from './api';

// En lectura el backend no devuelve password.
export interface Usuario extends Timestamps {
  id: number;
  username: string;
  email: string;
  status: Status;
}

// Al crear se envían los cuatro campos; al editar (PATCH) solo username y email.
export interface UsuarioPayload {
  username: string;
  email: string;
  password: string;
  status?: Status;
}

export type UsuarioPatch = Pick<UsuarioPayload, 'username' | 'email'>;
