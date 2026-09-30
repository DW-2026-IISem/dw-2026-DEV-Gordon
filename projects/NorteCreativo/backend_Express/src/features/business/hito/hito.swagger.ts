import { SwaggerModule } from '../../../swagger/types';
import { ESTADOS_HITO, STATUS_HITO } from './hito.model';

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
  description: 'Id numérico del hito',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación (estado fuera del ENUM, id inválido o campo requerido ausente)', 'ValidationError');
const notFound = jsonResponse('Hito no encontrado', 'Error');
const campaniaNotFound = jsonResponse('Campaña no encontrada', 'Error');
const hitoOCampaniaNotFound = jsonResponse('Hito o campaña no encontrado', 'Error');
const campaniaInactiva = jsonResponse('RN-08: la campaña está inactiva, no se crea hito', 'Error');
const conflicto = jsonResponse('RN-08 (campaña inactiva) o RN-06 (un hito CERRADO/FACTURADO no vuelve a ABIERTO)', 'Error');

// Los schemas Error, ValidationError, Message y Campania los aportan los módulos de cliente y campaña.
export const hitoSwagger: SwaggerModule = {
  tags: [{ name: 'Hitos', description: `CRUD de hitos de una campaña activa con reglas de estado. ${SIN_AUTH}` }],
  paths: {
    '/api/hitos': {
      get: {
        tags: ['Hitos'],
        summary: 'Listar hitos activos (SIN AUTH)',
        description: `Devuelve solo los hitos con status "active". ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de hitos activos', 'HitoList') },
      },
      post: {
        tags: ['Hitos'],
        summary: 'Crear hito (SIN AUTH)',
        description: `La campaña debe existir (404) y estar activa (409, RN-08). El hito siempre nace ABIERTO con fecha_cierre null: estado y fecha_cierre enviados se ignoran. ${SIN_AUTH}`,
        requestBody: jsonBody('HitoInput', 'Datos del hito'),
        responses: {
          '201': jsonResponse('Hito creado con estado ABIERTO y fecha_cierre null', 'HitoResponse'),
          '400': badRequest,
          '404': campaniaNotFound,
          '409': campaniaInactiva,
        },
      },
    },
    '/api/hitos/{id}': {
      get: {
        tags: ['Hitos'],
        summary: 'Obtener un hito con su campaña (SIN AUTH)',
        description: `Incluye la campaña asociada en la propiedad "campania". ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Hito con su campaña', 'HitoDetalleResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
      put: {
        tags: ['Hitos'],
        summary: 'Reemplazar un hito (SIN AUTH)',
        description: `campania_id y nombre son obligatorios; descripcion omitida queda en null y status omitido en "active". El estado solo cambia si se envía y respeta las invariantes (ENUM 400, no reabrir 409, CERRADO fija fecha_cierre); fecha_cierre enviada se ignora. La campaña debe existir (404) y estar activa (409). ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('HitoInput', 'Representación completa del hito'),
        responses: {
          '200': jsonResponse('Hito actualizado', 'HitoResponse'),
          '400': badRequest,
          '404': hitoOCampaniaNotFound,
          '409': conflicto,
        },
      },
      patch: {
        tags: ['Hitos'],
        summary: 'Actualizar campos de un hito (SIN AUTH)',
        description: `Modifica solo los campos enviados. Un estado fuera del ENUM responde 400; pasar a CERRADO asigna fecha_cierre = ahora; un hito CERRADO no vuelve a ABIERTO (409, RN-06). ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('HitoPatch', 'Campos a modificar'),
        responses: {
          '200': jsonResponse('Hito actualizado', 'HitoResponse'),
          '400': badRequest,
          '404': hitoOCampaniaNotFound,
          '409': conflicto,
        },
      },
      delete: {
        tags: ['Hitos'],
        summary: 'Borrado físico de un hito (SIN AUTH)',
        description: `Elimina la fila de la tabla hitos. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Hito eliminado', 'Message'),
          '400': badRequest,
          '404': notFound,
          '409': jsonResponse('El hito tiene tareas asociadas', 'Error'),
        },
      },
    },
    '/api/hitos/{id}/deactivate': {
      patch: {
        tags: ['Hitos'],
        summary: 'Borrado lógico de un hito (SIN AUTH)',
        description: `Cambia status a "inactive"; el hito deja de aparecer en el listado. No modifica el estado de negocio. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Hito desactivado', 'HitoResponse'),
          '400': badRequest,
          '404': notFound,
        },
      },
    },
  },
  components: {
    schemas: {
      Hito: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          campania_id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Campaña en redes' },
          descripcion: { type: 'string', nullable: true, example: 'Piezas y calendario de publicación' },
          estado: { type: 'string', enum: [...ESTADOS_HITO], example: 'ABIERTO' },
          fecha_cierre: { type: 'string', format: 'date-time', nullable: true, example: null },
          status: { type: 'string', enum: [...STATUS_HITO], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      HitoInput: {
        type: 'object',
        required: ['campania_id', 'nombre'],
        properties: {
          campania_id: { type: 'integer', description: 'Id de una campaña existente y activa', example: 1 },
          nombre: { type: 'string', minLength: 1, example: 'Campaña en redes' },
          descripcion: { type: 'string', example: 'Piezas y calendario de publicación' },
          estado: {
            type: 'string',
            enum: [...ESTADOS_HITO],
            description: 'Ignorado en POST (siempre nace ABIERTO). En PUT es opcional y respeta las invariantes.',
          },
          status: { type: 'string', enum: [...STATUS_HITO], default: 'active' },
        },
      },
      HitoPatch: {
        type: 'object',
        properties: {
          campania_id: { type: 'integer' },
          nombre: { type: 'string', minLength: 1 },
          descripcion: { type: 'string' },
          estado: { type: 'string', enum: [...ESTADOS_HITO], description: 'CERRADO fija fecha_cierre; no se puede volver a ABIERTO' },
          status: { type: 'string', enum: [...STATUS_HITO] },
        },
      },
      HitoResponse: {
        type: 'object',
        properties: { hito: { $ref: '#/components/schemas/Hito' } },
      },
      HitoDetalleResponse: {
        type: 'object',
        properties: {
          hito: {
            allOf: [
              { $ref: '#/components/schemas/Hito' },
              { type: 'object', properties: { campania: { $ref: '#/components/schemas/Campania' } } },
            ],
          },
        },
      },
      HitoList: {
        type: 'object',
        properties: {
          hitos: { type: 'array', items: { $ref: '#/components/schemas/Hito' } },
        },
      },
    },
  },
};
