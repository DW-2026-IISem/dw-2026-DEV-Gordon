import { Status, Timestamps } from './api';

export interface ConcesionRol extends Timestamps {
  id: number;
  role_id: number;
  resource_id: number;
  status: Status;
}

export interface ConcesionRolPayload {
  role_id: number;
  resource_id: number;
}

// Filtros de GET /api/concesiones-rol.
export interface ConcesionRolFiltros {
  role_id?: number;
  resource_id?: number;
}
