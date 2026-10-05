import { SwaggerModule } from '../../../swagger/types';
import { ESTADOS_ENTREGABLE, STATUS_ENTREGABLE } from './entregable.model';

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
  description: 'Id numérico del entregable',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación (id inválido, tarea_id ausente, estado fuera del ENUM, fecha o total inválidos)', 'ValidationError');
const notFound = jsonResponse('Entregable no encontrado', 'Error');
const tareaNotFound = jsonResponse('Tarea no encontrada', 'Error');
const entregableOTareaNotFound = jsonResponse('Entregable o tarea no encontrado', 'Error');

// Los schemas Error, ValidationError, Message y Tarea los aportan los módulos de cliente y tarea.
export const entregableSwagger: SwaggerModule = {
  tags: [{ name: 'Entregables', description: `CRUD de entregables de una tarea existente. ${SIN_AUTH}` }],
  paths: {
    '/api/entregables': {
      get: {
        tags: ['Entregables'],
        summary: 'Listar entregables activos (SIN AUTH)',
        description: `Devuelve solo los entregables con status "active". ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de entregables activos', 'EntregableList') },
      },
      post: {
        tags: ['Entregables'],
        summary: 'Crear entregable (SIN AUTH)',
        description: `La tarea debe existir (404). Si no se envía fecha_inicio se asigna la fecha actual; estado por defecto EN_PROCESO. ${SIN_AUTH}`,
        requestBody: jsonBody('EntregableInput', 'Datos del entregable'),
        responses: {
          '201': jsonResponse('Entregable creado', 'EntregableResponse'),
          '400': badRequest,
          '404': tareaNotFound,
        },
      },
    },
    '/api/entregables/{id}': {
      get: {
        tags: ['Entregables'],
        summary: 'Obtener un entregable con su tarea (SIN AUTH)',
        description: `Incluye la tarea asociada en la propiedad "tarea". ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Entregable con su tarea', 'EntregableDetalleResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
      put: {
        tags: ['Entregables'],
        summary: 'Reemplazar un entregable completo (SIN AUTH)',
        description: `tarea_id es obligatorio; los campos opcionales omitidos quedan en null, estado en "EN_PROCESO" y status en "active". La tarea debe existir (404). ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('EntregableInput', 'Representación completa del entregable'),
        responses: {
          '200': jsonResponse('Entregable actualizado', 'EntregableResponse'),
          '400': badRequest,
          '404': entregableOTareaNotFound,
        },
      },
      patch: {
        tags: ['Entregables'],
        summary: 'Actualizar campos de un entregable (SIN AUTH)',
        description: `Modifica solo los campos enviados; si se envía tarea_id se valida su existencia. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('EntregablePatch', 'Campos a modificar'),
        responses: {
          '200': jsonResponse('Entregable actualizado', 'EntregableResponse'),
          '400': badRequest,
          '404': entregableOTareaNotFound,
        },
      },
      delete: {
        tags: ['Entregables'],
        summary: 'Borrado físico de un entregable (SIN AUTH)',
        description: `Elimina la fila de la tabla entregables. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Entregable eliminado', 'Message'),
          '400': badRequest,
          '404': notFound,
          '409': jsonResponse('El entregable tiene versiones asociadas', 'Error'),
        },
      },
    },
    '/api/entregables/{id}/deactivate': {
      patch: {
        tags: ['Entregables'],
        summary: 'Borrado lógico de un entregable (SIN AUTH)',
        description: `Cambia status a "inactive"; el entregable deja de aparecer en el listado. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Entregable desactivado', 'EntregableResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
    },
  },
  components: {
    schemas: {
      Entregable: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          tarea_id: { type: 'integer', example: 1 },
          fecha_inicio: { type: 'string', format: 'date-time', nullable: true },
          fecha_fin: { type: 'string', format: 'date-time', nullable: true },
          total: { type: 'number', format: 'double', nullable: true, example: 1500.5, description: 'DECIMAL(12,2) devuelto como número' },
          estado: { type: 'string', enum: [...ESTADOS_ENTREGABLE], example: 'EN_PROCESO' },
          observaciones: { type: 'string', nullable: true, example: 'Primera entrega' },
          status: { type: 'string', enum: [...STATUS_ENTREGABLE], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      EntregableInput: {
        type: 'object',
        required: ['tarea_id'],
        properties: {
          tarea_id: { type: 'integer', description: 'Id de una tarea existente', example: 1 },
          fecha_inicio: { type: 'string', format: 'date-time', description: 'En POST, si se omite se asigna la fecha actual' },
          fecha_fin: { type: 'string', format: 'date-time' },
          total: { type: 'number', minimum: 0, example: 1500.5 },
          estado: { type: 'string', enum: [...ESTADOS_ENTREGABLE], default: 'EN_PROCESO' },
          observaciones: { type: 'string', example: 'Primera entrega' },
          status: { type: 'string', enum: [...STATUS_ENTREGABLE], default: 'active' },
        },
      },
      EntregablePatch: {
        type: 'object',
        properties: {
          tarea_id: { type: 'integer' },
          fecha_inicio: { type: 'string', format: 'date-time' },
          fecha_fin: { type: 'string', format: 'date-time' },
          total: { type: 'number', minimum: 0 },
          estado: { type: 'string', enum: [...ESTADOS_ENTREGABLE] },
          observaciones: { type: 'string' },
          status: { type: 'string', enum: [...STATUS_ENTREGABLE] },
        },
      },
      EntregableResponse: {
        type: 'object',
        properties: { entregable: { $ref: '#/components/schemas/Entregable' } },
      },
      EntregableDetalleResponse: {
        type: 'object',
        properties: {
          entregable: {
            allOf: [
              { $ref: '#/components/schemas/Entregable' },
              { type: 'object', properties: { tarea: { $ref: '#/components/schemas/Tarea' } } },
            ],
          },
        },
      },
      EntregableList: {
        type: 'object',
        properties: {
          entregables: { type: 'array', items: { $ref: '#/components/schemas/Entregable' } },
        },
      },
    },
  },
};
