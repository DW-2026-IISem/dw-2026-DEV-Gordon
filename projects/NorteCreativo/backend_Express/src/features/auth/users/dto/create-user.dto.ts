import { pickFields } from '../../../../shared/http/pick-fields';
import { STATUS_USER } from '../user.model';

export const CAMPOS_CREATE_USER = ['username', 'email', 'password', 'status'] as const;

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  status?: (typeof STATUS_USER)[number];
}

export const toCreateUserDto = (body: unknown): CreateUserDto => pickFields(body, CAMPOS_CREATE_USER) as unknown as CreateUserDto;
