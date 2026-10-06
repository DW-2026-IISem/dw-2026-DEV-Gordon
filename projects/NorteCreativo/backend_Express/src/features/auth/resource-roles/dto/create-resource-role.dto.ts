import { pickFields } from '../../../../shared/http/pick-fields';

export const CAMPOS_RESOURCE_ROLE = ['role_id', 'resource_id'] as const;

export interface CreateResourceRoleDto {
  role_id: number;
  resource_id: number;
}

// El service valida el contenido (enteros positivos): aquí solo se filtran los campos permitidos.
export const toCreateResourceRoleDto = (body: unknown): CreateResourceRoleDto =>
  pickFields(body, CAMPOS_RESOURCE_ROLE) as unknown as CreateResourceRoleDto;
