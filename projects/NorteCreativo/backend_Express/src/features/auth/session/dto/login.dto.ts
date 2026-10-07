import { pickFields } from '../../../../shared/http/pick-fields';

export interface LoginDto {
  // username o email
  identifier: string;
  password: string;
}

// El service valida el contenido: aquí solo se filtran los campos permitidos.
export const toLoginDto = (body: unknown): LoginDto => pickFields(body, ['identifier', 'password'] as const) as unknown as LoginDto;
