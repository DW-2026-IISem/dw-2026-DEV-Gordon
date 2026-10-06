import { pickFields } from '../../../../shared/http/pick-fields';

export const CAMPOS_ROLE_USER = ['user_id', 'role_id'] as const;

export interface CreateRoleUserDto {
  user_id: number;
  role_id: number;
}

// El service valida el contenido (enteros positivos): aquí solo se filtran los campos permitidos.
export const toCreateRoleUserDto = (body: unknown): CreateRoleUserDto => pickFields(body, CAMPOS_ROLE_USER) as unknown as CreateRoleUserDto;
