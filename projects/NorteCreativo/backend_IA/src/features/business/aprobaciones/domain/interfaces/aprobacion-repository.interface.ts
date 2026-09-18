import type { Aprobacion, EstadoAprobacion } from '../entities/aprobacion.entity.js';

export interface RegistrarAprobacionData {
  versionEntregableId: number;
  estado: Extract<EstadoAprobacion, 'APROBADA' | 'RECHAZADA'>;
  aprobadorId: number;
  comentario?: string;
}

export interface RegistrarAprobacionResultado {
  aprobacion: Aprobacion;
  hitoCerrado: boolean;
  hitoId: number;
  fechaCierre: Date | null;
}

export interface IAprobacionRepository {
  /**
   * Operación transaccional única: registra la aprobación/rechazo, refleja
   * el estado en la versión y, si corresponde, cierra el hito. Todo o nada.
   */
  registrarYEvaluarCierre(data: RegistrarAprobacionData): Promise<RegistrarAprobacionResultado>;
  findById(id: number): Promise<Aprobacion | null>;
}

export const APROBACION_REPOSITORY = Symbol('APROBACION_REPOSITORY');
