import { METODOS_HTTP } from './resource.model';

export interface CatalogResource {
  method: (typeof METODOS_HTTP)[number];
  path: string;
  description: string;
}

// CRUD estándar de un feature: 7 operaciones (el borrado lógico va por PATCH /:id/deactivate).
const crud = (base: string, singular: string, plural: string): CatalogResource[] => [
  { method: 'GET', path: base, description: `Listar ${plural} activos` },
  { method: 'POST', path: base, description: `Crear ${singular}` },
  { method: 'GET', path: `${base}/:id`, description: `Obtener ${singular} por id` },
  { method: 'PUT', path: `${base}/:id`, description: `Reemplazar ${singular}` },
  { method: 'PATCH', path: `${base}/:id`, description: `Actualizar campos de ${singular}` },
  { method: 'DELETE', path: `${base}/:id`, description: `Eliminar ${singular} (borrado físico)` },
  { method: 'PATCH', path: `${base}/:id/deactivate`, description: `Desactivar ${singular} (borrado lógico)` },
];

// Asignaciones (role_users) y concesiones (resource_roles): asignar/conceder, retirar/revocar (lógico) y reactivar.
const asignacionYConcesion = (base: string, singular: string, plural: string): CatalogResource[] => [
  { method: 'GET', path: base, description: `Listar ${plural} activas` },
  { method: 'POST', path: base, description: `Crear ${singular}` },
  { method: 'GET', path: `${base}/:id`, description: `Obtener ${singular} por id` },
  { method: 'PATCH', path: `${base}/:id/deactivate`, description: `Desactivar ${singular}` },
  { method: 'PATCH', path: `${base}/:id/reactivate`, description: `Reactivar ${singular}` },
];

// Un recurso por cada endpoint protegible. Orden determinista. Quedan fuera por ser abiertos:
// GET /api/health y /api/docs (+ docs.json); /api/sesiones (modalidad JWT: cada usuario solo ve las suyas, sin RBAC) y, más adelante, login/refresh/logout (abiertas).
export const RESOURCE_CATALOG: CatalogResource[] = [
  // --- negocio ---
  ...crud('/api/clientes', 'cliente', 'clientes'),
  ...crud('/api/campanias', 'campaña', 'campañas'),
  ...crud('/api/hitos', 'hito', 'hitos'),
  ...crud('/api/tareas', 'tarea', 'tareas'),
  ...crud('/api/entregables', 'entregable', 'entregables'),
  ...crud('/api/version-entregables', 'versión de entregable', 'versiones de entregable'),
  { method: 'GET', path: '/api/aprobaciones', description: 'Listar aprobaciones activas' },
  { method: 'POST', path: '/api/aprobaciones', description: 'Registrar aprobación (CerrarHito)' },
  { method: 'GET', path: '/api/aprobaciones/:id', description: 'Obtener aprobación por id' },
  // --- administración de seguridad ---
  ...crud('/api/usuarios', 'usuario', 'usuarios'),
  ...crud('/api/roles', 'rol', 'roles'),
  ...crud('/api/recursos', 'recurso', 'recursos'),
  ...asignacionYConcesion('/api/asignaciones-rol', 'asignación de rol', 'asignaciones de rol'),
  ...asignacionYConcesion('/api/concesiones-rol', 'concesión de recurso', 'concesiones de recurso'),
];
