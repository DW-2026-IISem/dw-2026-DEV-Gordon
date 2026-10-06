import { SwaggerModule } from '../../../swagger/types';
import { protegerPaths } from '../../../shared/http/swagger-security';
import { STATUS_ROLE } from './role.model';

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
  description: 'Id numérico del rol',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación o id no válido', 'RolValidationError');
const notFound = jsonResponse('Rol no encontrado', 'RolError');
const duplicated = jsonResponse('El nombre de rol ya está en uso', 'RolError');

export const rolesSwagger: SwaggerModule = {
  tags: [{ name: 'Roles', description: `Roles de Norte Creativo. Un rol por sí solo no concede nada: los permisos son concesiones (ISS-17). ${SIN_AUTH}` }],
  paths: protegerPaths({
    '/api/roles': {
      get: {
        tags: ['Roles'],
        summary: 'Listar roles activos (JWT + RBAC)',
        description: SIN_AUTH,
        responses: { '200': jsonResponse('Listado de roles activos', 'RolList') },
      },
      post: {
        tags: ['Roles'],
        summary: 'Crear rol (JWT + RBAC)',
        description: `El nombre se guarda en mayúsculas y es único. ${SIN_AUTH}`,
        requestBody: jsonBody('RolInput', 'Datos del rol'),
        responses: { '201': jsonResponse('Rol creado', 'RolResponse'), '400': badRequest, '409': duplicated },
      },
    },
    '/api/roles/{id}': {
      get: {
        tags: ['Roles'],
        summary: 'Obtener un rol por id (JWT + RBAC)',
        description: SIN_AUTH,
        parameters: [idParam],
        responses: { '200': jsonResponse('Rol encontrado', 'RolResponse'), '400': badRequest, '404': notFound },
      },
      put: {
        tags: ['Roles'],
        summary: 'Reemplazar un rol (JWT + RBAC)',
        description: `name es obligatorio; description omitida queda en null. status se ignora. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('RolUpdate', 'name y description'),
        responses: { '200': jsonResponse('Rol actualizado', 'RolResponse'), '400': badRequest, '404': notFound, '409': duplicated },
      },
      patch: {
        tags: ['Roles'],
        summary: 'Actualizar campos de un rol (JWT + RBAC)',
        description: `Modifica solo los campos enviados. status se ignora. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('RolPatch', 'Campos a modificar'),
        responses: { '200': jsonResponse('Rol actualizado', 'RolResponse'), '400': badRequest, '404': notFound, '409': duplicated },
      },
      delete: {
        tags: ['Roles'],
        summary: 'Borrado físico de un rol (JWT + RBAC)',
        description: SIN_AUTH,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Rol eliminado', 'RolMessage'),
          '400': badRequest,
          '404': notFound,
          '409': jsonResponse('El rol tiene usuarios o concesiones asociados', 'RolError'),
        },
      },
    },
    '/api/roles/{id}/deactivate': {
      patch: {
        tags: ['Roles'],
        summary: 'Borrado lógico de un rol (JWT + RBAC)',
        description: `Cambia status a "inactive"; deja de aparecer en el listado. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Rol desactivado', 'RolResponse'), '400': badRequest, '404': notFound },
      },
    },
  }),
  components: {
    schemas: {
      Rol: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'ADMIN' },
          description: { type: 'string', nullable: true, example: 'Administra usuarios, roles, recursos y concesiones' },
          status: { type: 'string', enum: [...STATUS_ROLE], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RolInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50, description: 'Único; se guarda en mayúsculas', example: 'AUDITOR' },
          description: { type: 'string', example: 'Consulta sin modificar' },
          status: { type: 'string', enum: [...STATUS_ROLE], default: 'active' },
        },
      },
      RolUpdate: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', minLength: 2, maxLength: 50 }, description: { type: 'string' } },
      },
      RolPatch: {
        type: 'object',
        properties: { name: { type: 'string', minLength: 2, maxLength: 50 }, description: { type: 'string' } },
      },
      RolResponse: { type: 'object', properties: { rol: { $ref: '#/components/schemas/Rol' } } },
      RolList: { type: 'object', properties: { roles: { type: 'array', items: { $ref: '#/components/schemas/Rol' } } } },
      RolMessage: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Rol eliminado' }, id: { type: 'integer', example: 1 } },
      },
      RolError: { type: 'object', properties: { message: { type: 'string', example: 'El nombre de rol ya está en uso' } } },
      RolValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error de validación' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};
