import { SwaggerModule } from '../../../swagger/types';

const SIN_AUTH = 'SIN AUTH (temporal): este endpoint no requiere autenticación hasta ISS-18/ISS-21.';

const jsonBody = (schema: string, description: string) => ({
  required: true,
  description,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } },
});
const jsonResponse = (description: string, schema: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } },
});
const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id numérico de la concesión',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación, filtro o id no válido', 'ConcesionValidationError');
const notFound = jsonResponse('Concesión, rol o recurso no encontrado (o inactivo)', 'ConcesionError');
const conflict = jsonResponse('Ya estaba en ese estado (concesión activa / inactiva)', 'ConcesionError');

export const resourceRolesSwagger: SwaggerModule = {
  tags: [
    {
      name: 'Concesiones de rol',
      description: `Concesión rol ↔ recurso (resource_roles): el permiso real. Conceder, revocar (borrado lógico) y reactivar sin duplicar filas. ${SIN_AUTH}`,
    },
  ],
  paths: {
    '/api/concesiones-rol': {
      get: {
        tags: ['Concesiones de rol'],
        summary: 'Listar concesiones activas (SIN AUTH)',
        description: `Filtros opcionales: role_id ("¿qué concede este rol?") y resource_id ("¿qué roles conceden este recurso?"). ${SIN_AUTH}`,
        parameters: [
          { name: 'role_id', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
          { name: 'resource_id', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: { '200': jsonResponse('Listado de concesiones activas', 'ConcesionList'), '400': badRequest },
      },
      post: {
        tags: ['Concesiones de rol'],
        summary: 'Conceder un recurso a un rol (SIN AUTH)',
        description: `Idempotente: si no existe la crea (201); si existe inactiva la reactiva sin duplicar (200); si ya está activa responde 409. Rol y recurso deben existir y estar activos (404). ${SIN_AUTH}`,
        requestBody: jsonBody('ConcesionInput', 'role_id y resource_id'),
        responses: {
          '201': jsonResponse('Concesión creada', 'ConcesionResponse'),
          '200': jsonResponse('Concesión inactiva reactivada (misma fila)', 'ConcesionResponse'),
          '400': badRequest,
          '404': notFound,
          '409': conflict,
        },
      },
    },
    '/api/concesiones-rol/{id}': {
      get: {
        tags: ['Concesiones de rol'],
        summary: 'Obtener una concesión por id (SIN AUTH)',
        description: SIN_AUTH,
        parameters: [idParam],
        responses: { '200': jsonResponse('Concesión encontrada', 'ConcesionResponse'), '400': badRequest, '404': notFound },
      },
    },
    '/api/concesiones-rol/{id}/deactivate': {
      patch: {
        tags: ['Concesiones de rol'],
        summary: 'Revocar una concesión (borrado lógico) (SIN AUTH)',
        description: `Pasa a "inactive"; la fila se conserva. 409 si ya estaba inactiva. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Concesión revocada', 'ConcesionResponse'), '400': badRequest, '404': notFound, '409': conflict },
      },
    },
    '/api/concesiones-rol/{id}/reactivate': {
      patch: {
        tags: ['Concesiones de rol'],
        summary: 'Reactivar una concesión (SIN AUTH)',
        description: `Vuelve a "active" (rol y recurso deben estar activos). 409 si ya estaba activa. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Concesión reactivada', 'ConcesionResponse'), '400': badRequest, '404': notFound, '409': conflict },
      },
    },
  },
  components: {
    schemas: {
      Concesion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          role_id: { type: 'integer', example: 1 },
          resource_id: { type: 'integer', example: 1 },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          role: {
            type: 'object',
            properties: { id: { type: 'integer' }, name: { type: 'string', example: 'CUENTAS' }, status: { type: 'string', example: 'active' } },
          },
          resource: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              method: { type: 'string', example: 'GET' },
              path: { type: 'string', example: '/api/clientes' },
              description: { type: 'string', nullable: true },
              status: { type: 'string', example: 'active' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ConcesionInput: {
        type: 'object',
        required: ['role_id', 'resource_id'],
        properties: { role_id: { type: 'integer', minimum: 1, example: 1 }, resource_id: { type: 'integer', minimum: 1, example: 1 } },
      },
      ConcesionResponse: { type: 'object', properties: { concesion: { $ref: '#/components/schemas/Concesion' } } },
      ConcesionList: {
        type: 'object',
        properties: { concesiones: { type: 'array', items: { $ref: '#/components/schemas/Concesion' } } },
      },
      ConcesionError: { type: 'object', properties: { message: { type: 'string', example: 'La concesión ya existe y está activa' } } },
      ConcesionValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error de validación' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};
