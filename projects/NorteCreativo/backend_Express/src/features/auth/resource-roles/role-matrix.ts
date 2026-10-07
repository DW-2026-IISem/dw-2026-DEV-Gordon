import { CatalogResource, RESOURCE_CATALOG } from '../resources/resource-catalog';

// Matriz de concesiones de Norte Creativo (decisión de diseño a partir de los actores del SDD).
// Se expresa sobre resource-catalog.ts: cada regla elige operaciones de un feature por su ruta base.

type Operacion = readonly [method: string, sufijo: string];

const LEER: Operacion[] = [['GET', ''], ['GET', '/:id']];
const CRUD: Operacion[] = [
  ...LEER,
  ['POST', ''],
  ['PUT', '/:id'],
  ['PATCH', '/:id'],
  ['DELETE', '/:id'],
  ['PATCH', '/:id/deactivate'],
];
const CREAR_LEER_ACTUALIZAR: Operacion[] = [...LEER, ['POST', ''], ['PUT', '/:id'], ['PATCH', '/:id']];
const CREAR_LEER: Operacion[] = [...LEER, ['POST', '']];

interface Regla {
  base: string;
  operaciones: Operacion[];
}

// ADMIN no tiene reglas: recibe TODO el catálogo salvo OPERACIONES_SOLO_DE_ROL (ver abajo).
export const MATRIZ_ROLES: Record<string, Regla[] | 'TODO'> = {
  ADMIN: 'TODO',
  CUENTAS: [
    { base: '/api/clientes', operaciones: LEER },
    { base: '/api/campanias', operaciones: CRUD },
    { base: '/api/hitos', operaciones: CRUD },
    { base: '/api/tareas', operaciones: CRUD },
    { base: '/api/entregables', operaciones: LEER },
    { base: '/api/version-entregables', operaciones: LEER },
    { base: '/api/aprobaciones', operaciones: LEER },
  ],
  CREATIVO: [
    { base: '/api/campanias', operaciones: LEER },
    { base: '/api/hitos', operaciones: LEER },
    { base: '/api/tareas', operaciones: LEER },
    { base: '/api/entregables', operaciones: CREAR_LEER_ACTUALIZAR },
    { base: '/api/version-entregables', operaciones: CREAR_LEER_ACTUALIZAR },
  ],
  CLIENTE_APROBADOR: [
    { base: '/api/campanias', operaciones: LEER },
    { base: '/api/hitos', operaciones: LEER },
    { base: '/api/entregables', operaciones: LEER },
    { base: '/api/version-entregables', operaciones: LEER },
    { base: '/api/aprobaciones', operaciones: CREAR_LEER },
  ],
  FINANZAS: [
    { base: '/api/clientes', operaciones: LEER },
    { base: '/api/campanias', operaciones: LEER },
    { base: '/api/hitos', operaciones: LEER },
  ],
};

// RN-05: aprobar es una decisión del lado del cliente. POST /api/aprobaciones lo tiene concedido SOLO
// CLIENTE_APROBADOR: ni siquiera ADMIN (que por lo demás lo tiene todo) puede registrar aprobaciones.
const OPERACIONES_SOLO_DE_ROL: Record<string, { method: string; path: string }[]> = {
  CLIENTE_APROBADOR: [{ method: 'POST', path: '/api/aprobaciones' }],
};
const reservada = (r: CatalogResource, roleName: string): boolean =>
  Object.entries(OPERACIONES_SOLO_DE_ROL).some(
    ([rol, ops]) => rol !== roleName && ops.some((o) => o.method === r.method && o.path === r.path)
  );

// Recursos del catálogo que corresponden a un rol. Falla si una regla apunta a una operación que no está en el
// catálogo (así la matriz y el catálogo no pueden divergir en silencio).
export function recursosDelRol(roleName: string): CatalogResource[] {
  const reglas = MATRIZ_ROLES[roleName];
  if (!reglas) throw new Error(`Rol sin entrada en la matriz: ${roleName}`);
  if (reglas === 'TODO') return RESOURCE_CATALOG.filter((r) => !reservada(r, roleName));

  const resultado: CatalogResource[] = [];
  for (const { base, operaciones } of reglas) {
    for (const [method, sufijo] of operaciones) {
      const recurso = RESOURCE_CATALOG.find((r) => r.method === method && r.path === `${base}${sufijo}`);
      if (!recurso) throw new Error(`La matriz de ${roleName} pide ${method} ${base}${sufijo}, que no está en resource-catalog.ts`);
      resultado.push(recurso);
    }
  }
  return resultado;
}
