import { pickFields } from '../../../../shared/http/pick-fields';
import { ESTADOS_PRESUPUESTO, STATUS_PRESUPUESTO } from '../presupuesto.model';

export const CAMPOS_PRESUPUESTO = ['campania_id', 'fecha', 'valor', 'estado', 'observaciones', 'status'] as const;

export interface CreatePresupuestoDto {
  campania_id: number;
  // En el body llega como texto ISO; el service valida que sea una fecha y Sequelize la convierte.
  fecha?: Date;
  valor: number;
  estado?: (typeof ESTADOS_PRESUPUESTO)[number];
  observaciones?: string | null;
  status?: (typeof STATUS_PRESUPUESTO)[number];
}

// El service valida el contenido: aquí solo se filtran los campos permitidos.
export const toCreatePresupuestoDto = (body: unknown): CreatePresupuestoDto =>
  pickFields(body, CAMPOS_PRESUPUESTO) as unknown as CreatePresupuestoDto;
