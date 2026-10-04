import { SwaggerModule } from '../../../swagger/types';
import { ESTADOS_CLIENTE, TIPOS_DOCUMENTO } from './cliente.model';

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

const errorResponse = (description: string, schema = 'Error') => jsonResponse(description, schema);

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id numérico del cliente',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badId = errorResponse('El id no es un entero positivo (o hay errores de validación)', 'ValidationError');
const notFound = errorResponse('Cliente no encontrado');
const duplicated = errorResponse('numero_documento ya registrado');

export const clienteSwagger: SwaggerModule = {
  tags: [{ name: 'Clientes', description: `CRUD de clientes de Norte Creativo. ${SIN_AUTH}` }],
  paths: {
    '/api/clientes': {
      get: {
        tags: ['Clientes'],
        summary: 'Listar clientes activos (SIN AUTH)',
        description: `Devuelve solo los clientes con status "active". ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de clientes activos', 'ClienteList') },
      },
      post: {
        tags: ['Clientes'],
        summary: 'Crear cliente (SIN AUTH)',
        description: SIN_AUTH,
        requestBody: jsonBody('ClienteInput', 'Datos del cliente'),
        responses: {
          '201': jsonResponse('Cliente creado con status active', 'ClienteResponse'),
          '400': errorResponse('Error de validación (falta un campo requerido o el formato es inválido)', 'ValidationError'),
          '409': duplicated,
        },
      },
    },
    '/api/clientes/{id}': {
      get: {
        tags: ['Clientes'],
        summary: 'Obtener un cliente por id (SIN AUTH)',
        description: SIN_AUTH,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Cliente encontrado', 'ClienteResponse'),
          '400': badId,
          '404': notFound,
        },
      },
      put: {
        tags: ['Clientes'],
        summary: 'Reemplazar un cliente completo (SIN AUTH)',
        description: `Reemplaza el recurso: tipo_documento, numero_documento y nombre son obligatorios; telefono y email omitidos quedan en null y status omitido queda en "active". ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('ClienteInput', 'Representación completa del cliente'),
        responses: {
          '200': jsonResponse('Cliente actualizado', 'ClienteResponse'),
          '400': badId,
          '404': notFound,
          '409': duplicated,
        },
      },
      patch: {
        tags: ['Clientes'],
        summary: 'Actualizar campos de un cliente (SIN AUTH)',
        description: `Modifica solo los campos enviados. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('ClientePatch', 'Campos a modificar'),
        responses: {
          '200': jsonResponse('Cliente actualizado', 'ClienteResponse'),
          '400': badId,
          '404': notFound,
          '409': duplicated,
        },
      },
      delete: {
        tags: ['Clientes'],
        summary: 'Borrado físico de un cliente (SIN AUTH)',
        description: `Elimina la fila de la tabla clientes. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Cliente eliminado', 'Message'),
          '400': badId,
          '404': notFound,
          '409': errorResponse('El cliente tiene campañas asociadas'),
        },
      },
    },
    '/api/clientes/{id}/deactivate': {
      patch: {
        tags: ['Clientes'],
        summary: 'Borrado lógico de un cliente (SIN AUTH)',
        description: `Cambia status a "inactive"; el cliente deja de aparecer en el listado. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Cliente desactivado', 'ClienteResponse'),
          '400': badId,
          '404': notFound,
        },
      },
    },
  },
  components: {
    schemas: {
      Cliente: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          tipo_documento: { type: 'string', enum: [...TIPOS_DOCUMENTO], example: 'NIT' },
          numero_documento: { type: 'string', example: '900123456' },
          nombre: { type: 'string', example: 'Postobón S.A.' },
          telefono: { type: 'string', nullable: true, example: '3001234567' },
          email: { type: 'string', format: 'email', nullable: true, example: 'contacto@postobon.com' },
          status: { type: 'string', enum: [...ESTADOS_CLIENTE], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ClienteInput: {
        type: 'object',
        required: ['tipo_documento', 'numero_documento', 'nombre'],
        properties: {
          tipo_documento: { type: 'string', enum: [...TIPOS_DOCUMENTO], example: 'NIT' },
          numero_documento: { type: 'string', description: 'Único entre todos los clientes', example: '900123456' },
          nombre: { type: 'string', minLength: 1, example: 'Postobón S.A.' },
          telefono: { type: 'string', example: '3001234567' },
          email: { type: 'string', format: 'email', example: 'contacto@postobon.com' },
          status: { type: 'string', enum: [...ESTADOS_CLIENTE], default: 'active' },
        },
      },
      ClientePatch: {
        type: 'object',
        properties: {
          tipo_documento: { type: 'string', enum: [...TIPOS_DOCUMENTO] },
          numero_documento: { type: 'string' },
          nombre: { type: 'string', minLength: 1 },
          telefono: { type: 'string' },
          email: { type: 'string', format: 'email' },
          status: { type: 'string', enum: [...ESTADOS_CLIENTE] },
        },
      },
      ClienteResponse: {
        type: 'object',
        properties: { cliente: { $ref: '#/components/schemas/Cliente' } },
      },
      ClienteList: {
        type: 'object',
        properties: {
          clientes: { type: 'array', items: { $ref: '#/components/schemas/Cliente' } },
        },
      },
      Message: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Cliente eliminado' } },
      },
      Error: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Cliente no encontrado' } },
      },
      ValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error de validación' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};
