import { pickFields } from '../../../../shared/http/pick-fields';

// PUT/PATCH no editan status: el estado cambia solo por el borrado lógico.
export const CAMPOS_UPDATE_ROLE = ['name', 'description'] as const;

export interface UpdateRoleDto {
  name: string;
  description?: string | null;
}

export const toUpdateRoleDto = (body: unknown): Partial<UpdateRoleDto> => pickFields(body, CAMPOS_UPDATE_ROLE) as Partial<UpdateRoleDto>;
