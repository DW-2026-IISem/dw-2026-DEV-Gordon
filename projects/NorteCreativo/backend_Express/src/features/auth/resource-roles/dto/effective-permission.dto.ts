// Permiso efectivo de un usuario, aplanado para el middleware authorize.
export interface EffectivePermissionDto {
  resource_id: number;
  method: string;
  path: string;
  role_id: number;
  role_name: string;
}
