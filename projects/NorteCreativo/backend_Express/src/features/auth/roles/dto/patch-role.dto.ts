import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_UPDATE_ROLE, UpdateRoleDto } from './update-role.dto';

export type PatchRoleDto = Partial<UpdateRoleDto>;

export const toPatchRoleDto = (body: unknown): PatchRoleDto => pickFields(body, CAMPOS_UPDATE_ROLE) as PatchRoleDto;
