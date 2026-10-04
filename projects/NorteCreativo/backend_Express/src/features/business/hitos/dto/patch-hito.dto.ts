import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_DE_CIERRE, CAMPOS_HITO, CreateHitoDto } from './create-hito.dto';

export type PatchHitoDto = Partial<CreateHitoDto>;

export const toPatchHitoDto = (body: unknown): PatchHitoDto => pickFields(body, [...CAMPOS_HITO, ...CAMPOS_DE_CIERRE]) as PatchHitoDto;
