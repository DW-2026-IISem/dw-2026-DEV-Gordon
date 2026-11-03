import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_PRESUPUESTO, CreatePresupuestoDto } from './create-presupuesto.dto';

export type PatchPresupuestoDto = Partial<CreatePresupuestoDto>;

export const toPatchPresupuestoDto = (body: unknown): PatchPresupuestoDto =>
  pickFields(body, CAMPOS_PRESUPUESTO) as PatchPresupuestoDto;
