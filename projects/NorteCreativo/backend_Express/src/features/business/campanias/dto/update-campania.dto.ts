import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_CAMPANIA, CreateCampaniaDto } from './create-campania.dto';

// PUT reemplaza el recurso: cliente_id y nombre son obligatorios.
export type UpdateCampaniaDto = Partial<CreateCampaniaDto>;

export const toUpdateCampaniaDto = (body: unknown): UpdateCampaniaDto => pickFields(body, CAMPOS_CAMPANIA) as UpdateCampaniaDto;
