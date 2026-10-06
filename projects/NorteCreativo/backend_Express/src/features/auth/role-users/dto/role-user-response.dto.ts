import { InferAttributes } from 'sequelize';
import { RoleUser } from '../role-user.model';

// Resúmenes incluidos por el repository: el usuario nunca trae password.
export interface RoleUserUserSummary {
  id: number;
  username: string;
  email: string;
  status: string;
}
export interface RoleUserRoleSummary {
  id: number;
  name: string;
  status: string;
}

export type RoleUserResponseDto = InferAttributes<RoleUser> & { user?: RoleUserUserSummary; role?: RoleUserRoleSummary };

export const toRoleUserResponse = (roleUser: RoleUser): RoleUserResponseDto => roleUser.toJSON();
