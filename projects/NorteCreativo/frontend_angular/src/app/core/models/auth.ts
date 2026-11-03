import { HttpMethod } from './api';

// Respuesta de login y refresh: solo el par de tokens.
export interface SessionTokens {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

export interface PerfilRol {
  id: number;
  name: string;
  description: string | null;
}

export interface Perfil {
  id: number;
  username: string;
  email: string;
  status: string;
  roles: PerfilRol[];
}

export interface Permiso {
  method: HttpMethod;
  path: string;
  roles: string[];
}

export interface PermisosRespuesta {
  total: number;
  permisos: Permiso[];
}
