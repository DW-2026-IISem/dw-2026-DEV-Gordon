import { SwaggerModule } from '../../../swagger/types';
import { STATUS_TAREA } from './tarea.model';

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
  description: 'Id numérico de la tarea',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación (id inválido, nombre o hito_id ausentes)', 'ValidationError');
const notFound = jsonResponse('Tarea no encontrada', 'Error');
const hitoNotFound = jsonResponse('Hito no encontrado', 'Error');
const tareaOHitoNotFound = jsonResponse('Tarea o hito no encontrado', 'Error');

// Los schemas Error, ValidationError, Message y Hito los aportan los módulos de cliente y hito.
export const tareaSwagger: SwaggerModule = {
  tags: [{ name: 'Tareas', description: `CRUD de tareas de un hito existente. ${SIN_AUTH}` }],
  paths: {
    '/api/tareas': {
      get: {
        tags: ['Tareas'],
        summary: 'Listar tareas activas (SIN AUTH)',
        description: `Devuelve solo las tareas con status "active". ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de tareas activas', 'TareaList') },
      },
      post: {
        tags: ['Tareas'],
        summary: 'Crear tarea (SIN AUTH)',
        description: `El hito debe existir (404). ${SIN_AUTH}`,
        requestBody: jsonBody('TareaInput', 'Datos de la tarea'),
        responses: {
          '201': jsonResponse('Tarea creada con status active', 'TareaResponse'),
          '400': badRequest,
          '404': hitoNotFound,
        },
      },
    },
    '/api/tareas/{id}': {
      get: {
        tags: ['Tareas'],
        summary: 'Obtener una tarea con su hito (SIN AUTH)',
        description: `Incluye el hito asociado en la propiedad "hito". ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Tarea con su hito', 'TareaDetalleResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
      put: {
        tags: ['Tareas'],
        summary: 'Reemplazar una tarea completa (SIN AUTH)',
        description: `hito_id y nombre son obligatorios; descripcion omitida queda en null y status omitido en "active". El hito debe existir (404). ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('TareaInput', 'Representación completa de la tarea'),
        responses: {
          '200': jsonResponse('Tarea actualizada', 'TareaResponse'),
          '400': badRequest,
          '404': tareaOHitoNotFound,
        },
      },
      patch: {
        tags: ['Tareas'],
        summary: 'Actualizar campos de una tarea (SIN AUTH)',
        description: `Modifica solo los campos enviados; si se envía hito_id se valida su existencia. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('TareaPatch', 'Campos a modificar'),
        responses: {
          '200': jsonResponse('Tarea actualizada', 'TareaResponse'),
          '400': badRequest,
          '404': tareaOHitoNotFound,
        },
      },
      delete: {
        tags: ['Tareas'],
        summary: 'Borrado físico de una tarea (SIN AUTH)',
        description: `Elimina la fila de la tabla tareas. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Tarea eliminada', 'Message'),
          '400': badRequest,
          '404': notFound,
        },
      },
    },
    '/api/tareas/{id}/deactivate': {
      patch: {
        tags: ['Tareas'],
        summary: 'Borrado lógico de una tarea (SIN AUTH)',
        description: `Cambia status a "inactive"; la tarea deja de aparecer en el listado. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Tarea desactivada', 'TareaResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
    },
  },
  components: {
    schemas: {
      Tarea: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          hito_id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Diseñar piezas' },
          descripcion: { type: 'string', nullable: true, example: 'Piezas gráficas para redes' },
          status: { type: 'string', enum: [...STATUS_TAREA], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TareaInput: {
        type: 'object',
        required: ['hito_id', 'nombre'],
        properties: {
          hito_id: { type: 'integer', description: 'Id de un hito existente', example: 1 },
          nombre: { type: 'string', minLength: 1, example: 'Diseñar piezas' },
          descripcion: { type: 'string', example: 'Piezas gráficas para redes' },
          status: { type: 'string', enum: [...STATUS_TAREA], default: 'active' },
        },
      },
      TareaPatch: {
        type: 'object',
        properties: {
          hito_id: { type: 'integer' },
          nombre: { type: 'string', minLength: 1 },
          descripcion: { type: 'string' },
          status: { type: 'string', enum: [...STATUS_TAREA] },
        },
      },
      TareaResponse: {
        type: 'object',
        properties: { tarea: { $ref: '#/components/schemas/Tarea' } },
      },
      TareaDetalleResponse: {
        type: 'object',
        properties: {
          tarea: {
            allOf: [
              { $ref: '#/components/schemas/Tarea' },
              { type: 'object', properties: { hito: { $ref: '#/components/schemas/Hito' } } },
            ],
          },
        },
      },
      TareaList: {
        type: 'object',
        properties: {
          tareas: { type: 'array', items: { $ref: '#/components/schemas/Tarea' } },
        },
      },
    },
  },
};
