import { SwaggerModule } from '../../../swagger/types';
import { protegerPaths } from '../../../shared/http/swagger-security';
import { STATUS_USER } from './user.model';

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
  description: 'Id numérico del usuario',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación o id no válido', 'UsuarioValidationError');
const notFound = jsonResponse('Usuario no encontrado', 'UsuarioError');
const duplicated = jsonResponse('username o email ya en uso', 'UsuarioError');

export const usersSwagger: SwaggerModule = {
  tags: [{ name: 'Usuarios', description: `Administración de usuarios. La contraseña se hashea con bcrypt y nunca se devuelve. ${SIN_AUTH}` }],
  paths: protegerPaths({
    '/api/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios activos (JWT + RBAC)',
        description: `Devuelve solo los usuarios con status "active", sin password. ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de usuarios activos', 'UsuarioList') },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario (JWT + RBAC)',
        description: `Nace con status "active" salvo que se envíe otro. password: 8 a 72 caracteres. ${SIN_AUTH}`,
        requestBody: jsonBody('UsuarioInput', 'Datos del usuario'),
        responses: {
          '201': jsonResponse('Usuario creado (sin password)', 'UsuarioResponse'),
          '400': badRequest,
          '409': duplicated,
        },
      },
    },
    '/api/usuarios/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener un usuario por id (JWT + RBAC)',
        description: `Un usuario inactivo responde 404. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Usuario encontrado', 'UsuarioResponse'), '400': badRequest, '404': notFound },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Reemplazar la identidad de un usuario (JWT + RBAC)',
        description: `username y email son obligatorios. password y status se ignoran. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('UsuarioUpdate', 'username y email'),
        responses: {
          '200': jsonResponse('Usuario actualizado', 'UsuarioResponse'),
          '400': badRequest,
          '404': notFound,
          '409': duplicated,
        },
      },
      patch: {
        tags: ['Usuarios'],
        summary: 'Actualizar campos de un usuario (JWT + RBAC)',
        description: `Modifica solo username y/o email. password y status se ignoran. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('UsuarioPatch', 'Campos a modificar'),
        responses: {
          '200': jsonResponse('Usuario actualizado', 'UsuarioResponse'),
          '400': badRequest,
          '404': notFound,
          '409': duplicated,
        },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Borrado físico de un usuario (JWT + RBAC)',
        description: `Elimina la fila de users. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Usuario eliminado', 'UsuarioMessage'),
          '400': badRequest,
          '404': notFound,
          '409': jsonResponse('El usuario tiene roles o sesiones asociados', 'UsuarioError'),
        },
      },
    },
    '/api/usuarios/{id}/deactivate': {
      patch: {
        tags: ['Usuarios'],
        summary: 'Borrado lógico de un usuario (JWT + RBAC)',
        description: `Cambia status a "inactive"; deja de aparecer en el listado. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Usuario desactivado', 'UsuarioResponse'), '400': badRequest, '404': notFound },
      },
    },
  }),
  components: {
    schemas: {
      Usuario: {
        type: 'object',
        description: 'Nunca incluye password',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'admin' },
          email: { type: 'string', format: 'email', example: 'admin@norte-creativo.example' },
          status: { type: 'string', enum: [...STATUS_USER], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UsuarioInput: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50, description: 'Único; se guarda en minúsculas', example: 'maria' },
          email: { type: 'string', format: 'email', description: 'Único; se guarda en minúsculas', example: 'maria@norte-creativo.example' },
          password: { type: 'string', format: 'password', minLength: 8, maxLength: 72, example: 'Clave-Lab-123' },
          status: { type: 'string', enum: [...STATUS_USER], default: 'active' },
        },
      },
      UsuarioUpdate: {
        type: 'object',
        required: ['username', 'email'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email' },
        },
      },
      UsuarioPatch: {
        type: 'object',
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email' },
        },
      },
      UsuarioResponse: { type: 'object', properties: { usuario: { $ref: '#/components/schemas/Usuario' } } },
      UsuarioList: {
        type: 'object',
        properties: { usuarios: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } } },
      },
      UsuarioMessage: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Usuario eliminado' }, id: { type: 'integer', example: 1 } },
      },
      UsuarioError: { type: 'object', properties: { message: { type: 'string', example: 'El username ya está en uso' } } },
      UsuarioValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error de validación' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};
