import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_PRESUPUESTO, CreatePresupuestoDto } from './create-presupuesto.dto';

// PUT reemplaza el recurso: campania_id y valor son obligatorios.
export type UpdatePresupuestoDto = Partial<CreatePresupuestoDto>;

export const toUpdatePresupuestoDto = (body: unknown): UpdatePresupuestoDto =>
  pickFields(body, CAMPOS_PRESUPUESTO) as UpdatePresupuestoDto;
