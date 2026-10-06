import { SwaggerModule } from '../../../swagger/types';
import { protegerPaths } from '../../../shared/http/swagger-security';

const SIN_AUTH = "JWT + RBAC: requiere 'Authorization: Bearer <token>' y una concesión activa para esta operación (401 sin token válido, 403 sin concesión).";

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
  description: 'Id numérico de la asignación',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación o id no válido', 'AsignacionValidationError');
const notFound = jsonResponse('Asignación, usuario o rol no encontrado (o inactivo)', 'AsignacionError');
const conflict = jsonResponse('Ya estaba en ese estado (asignación activa / inactiva)', 'AsignacionError');

export const roleUsersSwagger: SwaggerModule = {
  tags: [
    {
      name: 'Asignaciones de rol',
      description: `Asignación usuario ↔ rol (role_users). Asignar, retirar (borrado lógico) y reactivar sin duplicar filas. ${SIN_AUTH}`,
    },
  ],
  paths: protegerPaths({
    '/api/asignaciones-rol': {
      get: {
        tags: ['Asignaciones de rol'],
        summary: 'Listar asignaciones activas (JWT + RBAC)',
        description: `Cada asignación incluye un resumen del usuario (sin password) y del rol. ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de asignaciones activas', 'AsignacionList') },
      },
      post: {
        tags: ['Asignaciones de rol'],
        summary: 'Asignar un rol a un usuario (JWT + RBAC)',
        description: `Idempotente: si no existe la crea (201); si existe inactiva la reactiva sin duplicar (200); si ya está activa responde 409. Usuario y rol deben existir y estar activos (404). ${SIN_AUTH}`,
        requestBody: jsonBody('AsignacionInput', 'user_id y role_id'),
        responses: {
          '201': jsonResponse('Asignación creada', 'AsignacionResponse'),
          '200': jsonResponse('Asignación inactiva reactivada (misma fila)', 'AsignacionResponse'),
          '400': badRequest,
          '404': notFound,
          '409': conflict,
        },
      },
    },
    '/api/asignaciones-rol/{id}': {
      get: {
        tags: ['Asignaciones de rol'],
        summary: 'Obtener una asignación por id (JWT + RBAC)',
        description: SIN_AUTH,
        parameters: [idParam],
        responses: { '200': jsonResponse('Asignación encontrada', 'AsignacionResponse'), '400': badRequest, '404': notFound },
      },
    },
    '/api/asignaciones-rol/{id}/deactivate': {
      patch: {
        tags: ['Asignaciones de rol'],
        summary: 'Retirar una asignación (borrado lógico) (JWT + RBAC)',
        description: `Pasa a "inactive"; la fila se conserva. 409 si ya estaba inactiva. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Asignación retirada', 'AsignacionResponse'), '400': badRequest, '404': notFound, '409': conflict },
      },
    },
    '/api/asignaciones-rol/{id}/reactivate': {
      patch: {
        tags: ['Asignaciones de rol'],
        summary: 'Reactivar una asignación (JWT + RBAC)',
        description: `Vuelve a "active" (usuario y rol deben estar activos). 409 si ya estaba activa. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Asignación reactivada', 'AsignacionResponse'), '400': badRequest, '404': notFound, '409': conflict },
      },
    },
  }),
  components: {
    schemas: {
      Asignacion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 1 },
          role_id: { type: 'integer', example: 1 },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              username: { type: 'string', example: 'admin' },
              email: { type: 'string', example: 'admin@norte-creativo.example' },
              status: { type: 'string', example: 'active' },
            },
          },
          role: {
            type: 'object',
            properties: { id: { type: 'integer' }, name: { type: 'string', example: 'ADMIN' }, status: { type: 'string', example: 'active' } },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AsignacionInput: {
        type: 'object',
        required: ['user_id', 'role_id'],
        properties: { user_id: { type: 'integer', minimum: 1, example: 1 }, role_id: { type: 'integer', minimum: 1, example: 1 } },
      },
      AsignacionResponse: { type: 'object', properties: { asignacion: { $ref: '#/components/schemas/Asignacion' } } },
      AsignacionList: {
        type: 'object',
        properties: { asignaciones: { type: 'array', items: { $ref: '#/components/schemas/Asignacion' } } },
      },
      AsignacionError: { type: 'object', properties: { message: { type: 'string', example: 'La asignación ya existe y está activa' } } },
      AsignacionValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error de validación' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};
