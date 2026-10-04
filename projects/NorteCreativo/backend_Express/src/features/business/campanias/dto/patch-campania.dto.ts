import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_CAMPANIA, CreateCampaniaDto } from './create-campania.dto';

export type PatchCampaniaDto = Partial<CreateCampaniaDto>;

export const toPatchCampaniaDto = (body: unknown): PatchCampaniaDto => pickFields(body, CAMPOS_CAMPANIA) as PatchCampaniaDto;
