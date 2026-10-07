// Perfil del usuario autenticado: datos públicos (nunca password) y sus roles activos.
export interface ProfileRoleDto {
  id: number;
  name: string;
  description: string | null;
}

export interface ProfileDto {
  id: number;
  username: string;
  email: string;
  status: string;
  roles: ProfileRoleDto[];
}

// Permiso efectivo (method + path) y los roles del usuario que lo conceden.
export interface PermissionDto {
  method: string;
  path: string;
  roles: string[];
}
