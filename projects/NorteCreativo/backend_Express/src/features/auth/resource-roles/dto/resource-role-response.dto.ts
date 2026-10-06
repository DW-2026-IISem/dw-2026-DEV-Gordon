import { InferAttributes } from 'sequelize';
import { ResourceRole } from '../resource-role.model';

export interface ResourceRoleRoleSummary {
  id: number;
  name: string;
  status: string;
}
export interface ResourceRoleResourceSummary {
  id: number;
  method: string;
  path: string;
  description: string | null;
  status: string;
}

export type ResourceRoleResponseDto = InferAttributes<ResourceRole> & {
  role?: ResourceRoleRoleSummary;
  resource?: ResourceRoleResourceSummary;
};

export const toResourceRoleResponse = (resourceRole: ResourceRole): ResourceRoleResponseDto => resourceRole.toJSON();

// Resultado de reconcileRole.
export interface ReconcileRoleResult {
  role_id: number;
  activated: number;
  deactivated: number;
  total_active: number;
}
