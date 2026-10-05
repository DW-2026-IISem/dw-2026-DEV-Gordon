import { SwaggerModule } from '../../../swagger/types';
import { METODOS_HTTP, STATUS_RESOURCE } from './resource.model';

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
  description: 'Id numérico del recurso',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación o id no válido', 'RecursoValidationError');
const notFound = jsonResponse('Recurso no encontrado', 'RecursoError');
const duplicated = jsonResponse('Ya existe un recurso con ese method y path', 'RecursoError');

export const resourcesSwagger: SwaggerModule = {
  tags: [{ name: 'Recursos', description: `Catálogo de recursos: cada recurso es una operación HTTP (method, path con :id). Un recurso por sí solo no concede nada (ISS-17). ${SIN_AUTH}` }],
  paths: {
    '/api/recursos': {
      get: {
        tags: ['Recursos'],
        summary: 'Listar recursos activos (SIN AUTH)',
        description: SIN_AUTH,
        responses: { '200': jsonResponse('Listado de recursos activos', 'RecursoList') },
      },
      post: {
        tags: ['Recursos'],
        summary: 'Crear recurso (SIN AUTH)',
        description: `method en mayúsculas y path canónico (sin query ni barra final); el par (method, path) es único. ${SIN_AUTH}`,
        requestBody: jsonBody('RecursoInput', 'Datos del recurso'),
        responses: { '201': jsonResponse('Recurso creado', 'RecursoResponse'), '400': badRequest, '409': duplicated },
      },
    },
    '/api/recursos/{id}': {
      get: {
        tags: ['Recursos'],
        summary: 'Obtener un recurso por id (SIN AUTH)',
        description: SIN_AUTH,
        parameters: [idParam],
        responses: { '200': jsonResponse('Recurso encontrado', 'RecursoResponse'), '400': badRequest, '404': notFound },
      },
      put: {
        tags: ['Recursos'],
        summary: 'Reemplazar un recurso (SIN AUTH)',
        description: `method y path son obligatorios; description omitida queda en null. status se ignora. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('RecursoUpdate', 'method, path y description'),
        responses: { '200': jsonResponse('Recurso actualizado', 'RecursoResponse'), '400': badRequest, '404': notFound, '409': duplicated },
      },
      patch: {
        tags: ['Recursos'],
        summary: 'Actualizar campos de un recurso (SIN AUTH)',
        description: `Modifica solo los campos enviados. status se ignora. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('RecursoPatch', 'Campos a modificar'),
        responses: { '200': jsonResponse('Recurso actualizado', 'RecursoResponse'), '400': badRequest, '404': notFound, '409': duplicated },
      },
      delete: {
        tags: ['Recursos'],
        summary: 'Borrado físico de un recurso (SIN AUTH)',
        description: SIN_AUTH,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Recurso eliminado', 'RecursoMessage'),
          '400': badRequest,
          '404': notFound,
          '409': jsonResponse('El recurso tiene concesiones asociadas', 'RecursoError'),
        },
      },
    },
    '/api/recursos/{id}/deactivate': {
      patch: {
        tags: ['Recursos'],
        summary: 'Borrado lógico de un recurso (SIN AUTH)',
        description: `Cambia status a "inactive"; deja de aparecer en el listado. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Recurso desactivado', 'RecursoResponse'), '400': badRequest, '404': notFound },
      },
    },
  },
  components: {
    schemas: {
      Recurso: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          method: { type: 'string', enum: [...METODOS_HTTP], example: 'GET' },
          path: { type: 'string', example: '/api/hitos/:id' },
          description: { type: 'string', nullable: true, example: 'Obtener hito por id' },
          status: { type: 'string', enum: [...STATUS_RESOURCE], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RecursoInput: {
        type: 'object',
        required: ['method', 'path'],
        properties: {
          method: { type: 'string', enum: [...METODOS_HTTP], example: 'GET' },
          path: { type: 'string', maxLength: 191, description: 'Patrón con :id, no un valor concreto', example: '/api/hitos/:id' },
          description: { type: 'string', example: 'Obtener hito por id' },
          status: { type: 'string', enum: [...STATUS_RESOURCE], default: 'active' },
        },
      },
      RecursoUpdate: {
        type: 'object',
        required: ['method', 'path'],
        properties: {
          method: { type: 'string', enum: [...METODOS_HTTP] },
          path: { type: 'string', maxLength: 191 },
          description: { type: 'string' },
        },
      },
      RecursoPatch: {
        type: 'object',
        properties: {
          method: { type: 'string', enum: [...METODOS_HTTP] },
          path: { type: 'string', maxLength: 191 },
          description: { type: 'string' },
        },
      },
      RecursoResponse: { type: 'object', properties: { recurso: { $ref: '#/components/schemas/Recurso' } } },
      RecursoList: { type: 'object', properties: { recursos: { type: 'array', items: { $ref: '#/components/schemas/Recurso' } } } },
      RecursoMessage: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Recurso eliminado' }, id: { type: 'integer', example: 1 } },
      },
      RecursoError: { type: 'object', properties: { message: { type: 'string', example: 'Ya existe un recurso con ese method y path' } } },
      RecursoValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error de validación' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};
