import { Aprobacion } from '../entities/aprobacion.entity.js';

export const APROBACION_REPOSITORY = 'IAprobacionRepository';

export interface RegistrarAprobacionResultado {
  aprobacion: Aprobacion;
  hitoCerrado: boolean;
  hitoId: number | null;
  fechaCierre: Date | null;
}

export interface IAprobacionRepository {
  // Operación transaccional completa: registra la aprobación y,
  // si corresponde, cierra el hito — todo en una sola transacción.
  registrarYEvaluarCierre(aprobacion: Aprobacion): Promise<RegistrarAprobacionResultado>;
  findById(id: number): Promise<Aprobacion | null>;
}
