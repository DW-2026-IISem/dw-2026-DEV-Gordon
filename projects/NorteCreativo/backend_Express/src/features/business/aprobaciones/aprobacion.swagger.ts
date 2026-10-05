import { SwaggerModule } from '../../../swagger/types';
import { ESTADOS_APROBACION, STATUS_APROBACION } from './aprobacion.model';

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
  description: 'Id numérico de la aprobación',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

// Los schemas Error, ValidationError y VersionEntregable los aportan los módulos de cliente y versión de entregable.
export const aprobacionSwagger: SwaggerModule = {
  tags: [
    {
      name: 'Aprobaciones',
      description: `Aprobaciones/rechazos de versiones de entregable; una aprobación puede cerrar el hito automáticamente. Registro de auditoría: solo POST y GET. ${SIN_AUTH}`,
    },
  ],
  paths: {
    '/api/aprobaciones': {
      get: {
        tags: ['Aprobaciones'],
        summary: 'Listar aprobaciones (SIN AUTH)',
        description: `Devuelve las aprobaciones con status "active". ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de aprobaciones', 'AprobacionList') },
      },
      post: {
        tags: ['Aprobaciones'],
        summary: 'Registrar aprobación o rechazo y evaluar el cierre del hito (SIN AUTH)',
        description:
          'En una sola transacción: bloquea el hito, rechaza si no está ABIERTO (409, RN-06), guarda la aprobación y copia el veredicto a la versión. ' +
          'RECHAZADA nunca cierra el hito. APROBADA cierra el hito (CERRADO + fecha_cierre) si todos sus entregables tienen su última versión APROBADA. ' +
          `Cualquier error revierte todo. ${SIN_AUTH}`,
        requestBody: jsonBody('AprobacionInput', 'Veredicto sobre una versión de entregable'),
        responses: {
          '201': jsonResponse('Aprobación registrada', 'AprobacionResultadoResponse'),
          '400': jsonResponse('Falta version_entregable_id o aprobador_id, o estado distinto de APROBADA/RECHAZADA', 'ValidationError'),
          '404': jsonResponse('Versión de entregable no encontrada', 'Error'),
          '409': jsonResponse('RN-06: el hito ya está cerrado y no admite nuevas aprobaciones', 'Error'),
        },
      },
    },
    '/api/aprobaciones/{id}': {
      get: {
        tags: ['Aprobaciones'],
        summary: 'Obtener una aprobación con su versión (SIN AUTH)',
        description: `Incluye la versión de entregable en la propiedad "version". ${SIN_AUTH}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Aprobación con su versión', 'AprobacionDetalleResponse'),
          '400': jsonResponse('Id inválido', 'ValidationError'),
          '404': jsonResponse('Aprobación no encontrada', 'Error'),
        },
      },
    },
  },
  components: {
    schemas: {
      Aprobacion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          version_entregable_id: { type: 'integer', example: 1 },
          estado: { type: 'string', enum: [...ESTADOS_APROBACION], example: 'APROBADA' },
          aprobador_id: { type: 'integer', example: 1 },
          comentario: { type: 'string', nullable: true },
          fecha: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: [...STATUS_APROBACION], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AprobacionInput: {
        type: 'object',
        required: ['version_entregable_id', 'estado', 'aprobador_id'],
        properties: {
          version_entregable_id: { type: 'integer', example: 1 },
          estado: { type: 'string', enum: ['APROBADA', 'RECHAZADA'], example: 'APROBADA' },
          aprobador_id: { type: 'integer', description: 'Sin validar rol ni usuario (no hay tabla de usuarios)', example: 1 },
          comentario: { type: 'string', example: 'Cumple con el brief' },
        },
      },
      AprobacionResultadoResponse: {
        type: 'object',
        properties: {
          aprobacion: { $ref: '#/components/schemas/Aprobacion' },
          hito_cerrado: { type: 'boolean', example: true },
          hito_id: { type: 'integer', example: 1 },
          fecha_cierre: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      AprobacionDetalleResponse: {
        type: 'object',
        properties: {
          aprobacion: {
            allOf: [
              { $ref: '#/components/schemas/Aprobacion' },
              { type: 'object', properties: { version: { $ref: '#/components/schemas/VersionEntregable' } } },
            ],
          },
        },
      },
      AprobacionList: {
        type: 'object',
        properties: {
          aprobaciones: { type: 'array', items: { $ref: '#/components/schemas/Aprobacion' } },
        },
      },
    },
  },
};
