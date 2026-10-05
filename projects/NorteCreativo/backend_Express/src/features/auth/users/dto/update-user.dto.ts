import { pickFields } from '../../../../shared/http/pick-fields';

// PUT/PATCH solo editan la identidad: password y status se descartan (la contraseña tendrá su propio endpoint).
export const CAMPOS_UPDATE_USER = ['username', 'email'] as const;

export interface UpdateUserDto {
  username: string;
  email: string;
}

export const toUpdateUserDto = (body: unknown): Partial<UpdateUserDto> => pickFields(body, CAMPOS_UPDATE_USER) as Partial<UpdateUserDto>;
