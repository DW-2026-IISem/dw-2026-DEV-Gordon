import { SwaggerModule } from '../../../swagger/types';
import { ESTADOS_VERSION, STATUS_VERSION } from './version-entregable.model';

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
  description: 'Id numérico de la versión de entregable',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse(
  'Error de validación (id inválido, entregable_id ausente/inválido, o body con estado / numero_version)',
  'ValidationError'
);
const notFound = jsonResponse('Versión de entregable no encontrada', 'Error');
const entregableNotFound = jsonResponse('Entregable no encontrado', 'Error');
const aprobada = jsonResponse('RN-04: la versión está APROBADA y no se puede modificar ni eliminar', 'Error');

// Los schemas Error, ValidationError, Message y Entregable los aportan los módulos de cliente y entregable.
export const versionEntregableSwagger: SwaggerModule = {
  tags: [
    {
      name: 'Versiones de entregable',
      description: `Versiones numeradas de un entregable. numero_version y estado los controla el sistema. ${SIN_AUTH}`,
    },
  ],
  paths: {
    '/api/version-entregables': {
      get: {
        tags: ['Versiones de entregable'],
        summary: 'Listar versiones activas (SIN AUTH)',
        description: `Devuelve solo las versiones con status "active". ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de versiones activas', 'VersionEntregableList') },
      },
      post: {
        tags: ['Versiones de entregable'],
        summary: 'Crear versión de entregable (SIN AUTH)',
        description: `numero_version es automático (cantidad de versiones del entregable + 1) y el estado nace EN_REVISION. Enviar estado o numero_version responde 400. El entregable debe existir (404) y su hito no puede estar CERRADO (409, RN-06). ${SIN_AUTH}`,
        requestBody: jsonBody('VersionEntregableInput', 'Datos de la versión'),
        responses: {
          '201': jsonResponse('Versión creada con numero_version asignado y estado EN_REVISION', 'VersionEntregableResponse'),
          '400': badRequest,
          '404': entregableNotFound,
          '409': jsonResponse('RN-06: el hito del entregable está CERRADO', 'Error'),
        },
      },
    },
    '/api/version-entregables/{id}': {
      get: {
        tags: ['Versiones de entregable'],
        summary: 'Obtener una versión con su entregable (SIN AUTH)',
        description: `Incluye el entregable asociado en la propiedad "entregable". ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Versión con su entregable', 'VersionEntregableDetalleResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
      put: {
        tags: ['Versiones de entregable'],
        summary: 'Reemplazar una versión (SIN AUTH)',
        description: `Reemplaza los campos editables: los opcionales omitidos quedan en null y status en "active". numero_version y estado no se pueden enviar (400) y entregable_id no se puede cambiar. Una versión APROBADA responde 409 (RN-04). ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('VersionEntregablePatch', 'Representación de los campos editables'),
        responses: {
          '200': jsonResponse('Versión actualizada', 'VersionEntregableResponse'),
          '400': badRequest,
          '404': notFound,
          '409': aprobada,
        },
      },
      patch: {
        tags: ['Versiones de entregable'],
        summary: 'Actualizar campos de una versión (SIN AUTH)',
        description: `Modifica solo los campos enviados. estado o numero_version en el body responden 400. Una versión APROBADA responde 409 (RN-04). ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('VersionEntregablePatch', 'Campos a modificar'),
        responses: {
          '200': jsonResponse('Versión actualizada', 'VersionEntregableResponse'),
          '400': badRequest,
          '404': notFound,
          '409': aprobada,
        },
      },
      delete: {
        tags: ['Versiones de entregable'],
        summary: 'Borrado físico de una versión (SIN AUTH)',
        description: `Elimina la fila de la tabla version_entregables. Una versión APROBADA responde 409 (RN-04), igual que una versión con aprobaciones asociadas. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Versión eliminada', 'Message'),
          '400': badRequest,
          '404': notFound,
          '409': jsonResponse('RN-04 (versión APROBADA) o la versión tiene aprobaciones asociadas', 'Error'),
        },
      },
    },
    '/api/version-entregables/{id}/deactivate': {
      patch: {
        tags: ['Versiones de entregable'],
        summary: 'Borrado lógico de una versión (SIN AUTH)',
        description: `Cambia status a "inactive"; la versión deja de aparecer en el listado. Una versión APROBADA responde 409 (RN-04). ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Versión desactivada', 'VersionEntregableResponse'),
          '400': badRequest,
          '404': notFound,
          '409': aprobada,
        },
      },
    },
  },
  components: {
    schemas: {
      VersionEntregable: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          entregable_id: { type: 'integer', example: 1 },
          numero_version: { type: 'integer', example: 1 },
          fecha_inicio: { type: 'string', format: 'date-time', nullable: true },
          fecha_fin: { type: 'string', format: 'date-time', nullable: true },
          total: { type: 'number', format: 'double', nullable: true, example: 1200.5 },
          estado: { type: 'string', enum: [...ESTADOS_VERSION], example: 'EN_REVISION' },
          observaciones: { type: 'string', nullable: true },
          status: { type: 'string', enum: [...STATUS_VERSION], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      VersionEntregableInput: {
        type: 'object',
        required: ['entregable_id'],
        properties: {
          entregable_id: { type: 'integer', description: 'Id de un entregable existente', example: 1 },
          fecha_inicio: { type: 'string', format: 'date-time' },
          fecha_fin: { type: 'string', format: 'date-time' },
          total: { type: 'number', minimum: 0, example: 1200.5 },
          observaciones: { type: 'string' },
          status: { type: 'string', enum: [...STATUS_VERSION], default: 'active' },
        },
        description: 'No enviar numero_version ni estado: los controla el sistema (400).',
      },
      VersionEntregablePatch: {
        type: 'object',
        properties: {
          fecha_inicio: { type: 'string', format: 'date-time' },
          fecha_fin: { type: 'string', format: 'date-time' },
          total: { type: 'number', minimum: 0 },
          observaciones: { type: 'string' },
          status: { type: 'string', enum: [...STATUS_VERSION] },
        },
        description: 'No enviar numero_version ni estado: los controla el sistema (400).',
      },
      VersionEntregableResponse: {
        type: 'object',
        properties: { version: { $ref: '#/components/schemas/VersionEntregable' } },
      },
      VersionEntregableDetalleResponse: {
        type: 'object',
        properties: {
          version: {
            allOf: [
              { $ref: '#/components/schemas/VersionEntregable' },
              { type: 'object', properties: { entregable: { $ref: '#/components/schemas/Entregable' } } },
            ],
          },
        },
      },
      VersionEntregableList: {
        type: 'object',
        properties: {
          versiones: { type: 'array', items: { $ref: '#/components/schemas/VersionEntregable' } },
        },
      },
    },
  },
};
