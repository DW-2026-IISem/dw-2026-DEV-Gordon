import { AppError } from '../../../../shared/errors/app-error';

// Filtros de GET /api/concesiones-rol: "¿qué concede este rol?" (role_id) y "¿qué roles conceden este recurso?" (resource_id).
export interface ListResourceRolesDto {
  role_id?: number;
  resource_id?: number;
}

const filtroEntero = (valor: unknown, nombre: string, errores: string[]): number | undefined => {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || !/^\d+$/.test(valor) || Number(valor) < 1) {
    errores.push(`${nombre} debe ser un entero positivo`);
    return undefined;
  }
  return Number(valor);
};

export const toListResourceRolesDto = (query: Record<string, unknown>): ListResourceRolesDto => {
  const errores: string[] = [];
  const filtros: ListResourceRolesDto = {
    role_id: filtroEntero(query.role_id, 'role_id', errores),
    resource_id: filtroEntero(query.resource_id, 'resource_id', errores),
  };
  if (errores.length > 0) throw new AppError(400, 'Error de validación', errores);
  return filtros;
};
