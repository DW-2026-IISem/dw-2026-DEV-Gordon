import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_UPDATE_USER, UpdateUserDto } from './update-user.dto';

export type PatchUserDto = Partial<UpdateUserDto>;

export const toPatchUserDto = (body: unknown): PatchUserDto => pickFields(body, CAMPOS_UPDATE_USER) as PatchUserDto;
