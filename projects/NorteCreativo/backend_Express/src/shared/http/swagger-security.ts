// Piezas reutilizables de OpenAPI para las 3 modalidades de acceso (OPEN, JWT, JWT + RBAC).

export const bearerSecurityScheme = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Access token en la cabecera "Authorization: Bearer <token>".',
};

export const unauthorizedResponse = {
  description: 'Sin token, token inválido o vencido, o usuario inexistente/inactivo',
  content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'Token inválido o vencido' } } } } },
};

export const forbiddenResponse = {
  description: 'Token válido pero sin concesión activa para este method + path (deny by default)',
  content: {
    'application/json': {
      schema: { type: 'object', properties: { message: { type: 'string', example: 'No autorizado: sin concesión para GET /api/usuarios' } } },
    },
  },
};

type Operacion = { responses?: Record<string, unknown>; [clave: string]: unknown };

// Marca TODAS las operaciones de los paths como JWT + RBAC: security bearerAuth + respuestas 401 y 403.
export function protegerPaths(paths: Record<string, Record<string, unknown>>): Record<string, unknown> {
  const resultado: Record<string, unknown> = {};
  for (const [ruta, operaciones] of Object.entries(paths)) {
    const nuevas: Record<string, unknown> = {};
    for (const [metodo, operacion] of Object.entries(operaciones)) {
      const op = operacion as Operacion;
      nuevas[metodo] = {
        ...op,
        security: [{ bearerAuth: [] }],
        responses: { ...op.responses, '401': unauthorizedResponse, '403': forbiddenResponse },
      };
    }
    resultado[ruta] = nuevas;
  }
  return resultado;
}
