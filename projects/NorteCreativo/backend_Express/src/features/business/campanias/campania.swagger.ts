import { SwaggerModule } from '../../../swagger/types';
import { ESTADOS_CAMPANIA } from './campania.model';

const SIN_AUTH = 'SIN AUTH: este endpoint no requiere autenticación.';

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
  description: 'Id numérico de la campaña',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación (o id no es un entero positivo)', 'ValidationError');
const notFound = jsonResponse('Campaña no encontrada', 'Error');
const clienteNotFound = jsonResponse('Campaña o cliente no encontrado', 'Error');
const clienteInactivo = jsonResponse('El cliente está inactivo: no se crea campaña para un cliente inactivo', 'Error');

// Los schemas Error, ValidationError, Message y Cliente los aporta el módulo de cliente.
export const campaniaSwagger: SwaggerModule = {
  tags: [{ name: 'Campañas', description: `CRUD de campañas asociadas a un cliente activo. ${SIN_AUTH}` }],
  paths: {
    '/api/campanias': {
      get: {
        tags: ['Campañas'],
        summary: 'Listar campañas activas (SIN AUTH)',
        description: `Devuelve solo las campañas con status "active". ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de campañas activas', 'CampaniaList') },
      },
      post: {
        tags: ['Campañas'],
        summary: 'Crear campaña (SIN AUTH)',
        description: `El cliente debe existir (404) y estar activo (409). ${SIN_AUTH}`,
        requestBody: jsonBody('CampaniaInput', 'Datos de la campaña'),
        responses: {
          '201': jsonResponse('Campaña creada con status active', 'CampaniaResponse'),
          '400': badRequest,
          '404': jsonResponse('Cliente no encontrado', 'Error'),
          '409': clienteInactivo,
        },
      },
    },
    '/api/campanias/{id}': {
      get: {
        tags: ['Campañas'],
        summary: 'Obtener una campaña con su cliente (SIN AUTH)',
        description: `Incluye el cliente asociado en la propiedad "cliente". ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Campaña con su cliente', 'CampaniaDetalleResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
      put: {
        tags: ['Campañas'],
        summary: 'Reemplazar una campaña completa (SIN AUTH)',
        description: `cliente_id y nombre son obligatorios; descripcion omitida queda en null y status omitido en "active". El cliente debe existir (404) y estar activo (409). ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('CampaniaInput', 'Representación completa de la campaña'),
        responses: {
          '200': jsonResponse('Campaña actualizada', 'CampaniaResponse'),
          '400': badRequest,
          '404': clienteNotFound,
          '409': clienteInactivo,
        },
      },
      patch: {
        tags: ['Campañas'],
        summary: 'Actualizar campos de una campaña (SIN AUTH)',
        description: `Modifica solo los campos enviados; si se envía cliente_id se valida igual que en la creación. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('CampaniaPatch', 'Campos a modificar'),
        responses: {
          '200': jsonResponse('Campaña actualizada', 'CampaniaResponse'),
          '400': badRequest,
          '404': clienteNotFound,
          '409': clienteInactivo,
        },
      },
      delete: {
        tags: ['Campañas'],
        summary: 'Borrado físico de una campaña (SIN AUTH)',
        description: `Elimina la fila de la tabla campanias. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Campaña eliminada', 'Message'),
          '400': badRequest,
          '404': notFound,
          '409': jsonResponse('La campaña tiene hitos asociados', 'Error'),
        },
      },
    },
    '/api/campanias/{id}/deactivate': {
      patch: {
        tags: ['Campañas'],
        summary: 'Borrado lógico de una campaña (SIN AUTH)',
        description: `Cambia status a "inactive"; la campaña deja de aparecer en el listado. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Campaña desactivada', 'CampaniaResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
    },
  },
  components: {
    schemas: {
      Campania: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          cliente_id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Carnaval 2026' },
          descripcion: { type: 'string', nullable: true, example: 'Campaña de lanzamiento de temporada' },
          status: { type: 'string', enum: [...ESTADOS_CAMPANIA], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CampaniaInput: {
        type: 'object',
        required: ['cliente_id', 'nombre'],
        properties: {
          cliente_id: { type: 'integer', description: 'Id de un cliente existente y activo', example: 1 },
          nombre: { type: 'string', minLength: 1, example: 'Carnaval 2026' },
          descripcion: { type: 'string', example: 'Campaña de lanzamiento de temporada' },
          status: { type: 'string', enum: [...ESTADOS_CAMPANIA], default: 'active' },
        },
      },
      CampaniaPatch: {
        type: 'object',
        properties: {
          cliente_id: { type: 'integer' },
          nombre: { type: 'string', minLength: 1 },
          descripcion: { type: 'string' },
          status: { type: 'string', enum: [...ESTADOS_CAMPANIA] },
        },
      },
      CampaniaResponse: {
        type: 'object',
        properties: { campania: { $ref: '#/components/schemas/Campania' } },
      },
      CampaniaDetalleResponse: {
        type: 'object',
        properties: {
          campania: {
            allOf: [
              { $ref: '#/components/schemas/Campania' },
              { type: 'object', properties: { cliente: { $ref: '#/components/schemas/Cliente' } } },
            ],
          },
        },
      },
      CampaniaList: {
        type: 'object',
        properties: {
          campanias: { type: 'array', items: { $ref: '#/components/schemas/Campania' } },
        },
      },
    },
  },
};
