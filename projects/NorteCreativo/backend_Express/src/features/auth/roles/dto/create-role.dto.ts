import { pickFields } from '../../../../shared/http/pick-fields';
import { STATUS_ROLE } from '../role.model';

export const CAMPOS_CREATE_ROLE = ['name', 'description', 'status'] as const;

export interface CreateRoleDto {
  name: string;
  description?: string | null;
  status?: (typeof STATUS_ROLE)[number];
}

export const toCreateRoleDto = (body: unknown): CreateRoleDto => pickFields(body, CAMPOS_CREATE_ROLE) as unknown as CreateRoleDto;
