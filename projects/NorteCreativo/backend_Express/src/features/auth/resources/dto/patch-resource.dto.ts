import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_UPDATE_RESOURCE, UpdateResourceDto } from './update-resource.dto';

export type PatchResourceDto = Partial<UpdateResourceDto>;

export const toPatchResourceDto = (body: unknown): PatchResourceDto => pickFields(body, CAMPOS_UPDATE_RESOURCE) as PatchResourceDto;
