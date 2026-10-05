import { InferAttributes } from 'sequelize';
import { Role } from '../role.model';

export type RoleResponseDto = InferAttributes<Role>;

export const toRoleResponse = (role: Role): RoleResponseDto => role.toJSON();
