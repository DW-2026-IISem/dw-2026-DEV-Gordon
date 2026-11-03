import { SwaggerModule } from '../../../swagger/types';
import { protegerPaths } from '../../../shared/http/swagger-security';
import { ESTADOS_PRESUPUESTO, STATUS_PRESUPUESTO } from './presupuesto.model';

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
  description: 'Id numérico del presupuesto',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const badRequest = jsonResponse('Error de validación (o id no es un entero positivo)', 'ValidationError');
const notFound = jsonResponse('Presupuesto no encontrado', 'Error');
const campaniaNotFound = jsonResponse('Presupuesto o campaña no encontrado', 'Error');
const conflicto = jsonResponse('La campaña está inactiva, o el presupuesto está APROBADO (inmutable)', 'Error');

// Los schemas Error, ValidationError, Message y Campania los aportan los módulos de cliente y campaña.
export const presupuestoSwagger: SwaggerModule = {
  tags: [
    {
      name: 'Presupuestos',
      description: `Presupuestos por campaña (BORRADOR -> APROBADO). Un presupuesto APROBADO es inmutable y es el tope de RN-03 al facturar. ${SIN_AUTH}`,
    },
  ],
  paths: protegerPaths({
    '/api/presupuestos': {
      get: {
        tags: ['Presupuestos'],
        summary: 'Listar presupuestos activos (JWT + RBAC)',
        description: `Devuelve solo los presupuestos con status "active". ${SIN_AUTH}`,
        responses: { '200': jsonResponse('Listado de presupuestos activos', 'PresupuestoList') },
      },
      post: {
        tags: ['Presupuestos'],
        summary: 'Crear presupuesto (JWT + RBAC)',
        description: `Nace en estado BORRADOR. La campaña debe existir (404) y estar activa (409); valor es obligatorio y > 0 (400). ${SIN_AUTH}`,
        requestBody: jsonBody('PresupuestoInput', 'Datos del presupuesto'),
        responses: {
          '201': jsonResponse('Presupuesto creado', 'PresupuestoResponse'),
          '400': badRequest,
          '404': jsonResponse('Campaña no encontrada', 'Error'),
          '409': jsonResponse('La campaña está inactiva', 'Error'),
        },
      },
    },
    '/api/presupuestos/{id}': {
      get: {
        tags: ['Presupuestos'],
        summary: 'Obtener un presupuesto con su campaña (JWT + RBAC)',
        description: SIN_AUTH,
        parameters: [idParam],
        responses: { '200': jsonResponse('Presupuesto con su campaña', 'PresupuestoResponse'), '400': badRequest, '404': notFound },
      },
      put: {
        tags: ['Presupuestos'],
        summary: 'Reemplazar un presupuesto completo (JWT + RBAC)',
        description: `campania_id y valor son obligatorios. Un presupuesto APROBADO responde 409. ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('PresupuestoInput', 'Representación completa del presupuesto'),
        responses: { '200': jsonResponse('Presupuesto actualizado', 'PresupuestoResponse'), '400': badRequest, '404': campaniaNotFound, '409': conflicto },
      },
      patch: {
        tags: ['Presupuestos'],
        summary: 'Actualizar campos de un presupuesto / aprobarlo (JWT + RBAC)',
        description: `Enviar estado "APROBADO" aprueba el presupuesto; desde ese momento ya no se edita ni se desactiva (409). ${SIN_AUTH}`,
        parameters: [idParam],
        requestBody: jsonBody('PresupuestoPatch', 'Campos a modificar'),
        responses: { '200': jsonResponse('Presupuesto actualizado', 'PresupuestoResponse'), '400': badRequest, '404': campaniaNotFound, '409': conflicto },
      },
      delete: {
        tags: ['Presupuestos'],
        summary: 'Borrado físico de un presupuesto (JWT + RBAC)',
        description: `Solo presupuestos en BORRADOR; uno APROBADO responde 409. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Presupuesto eliminado', 'Message'), '400': badRequest, '404': notFound, '409': conflicto },
      },
    },
    '/api/presupuestos/{id}/deactivate': {
      patch: {
        tags: ['Presupuestos'],
        summary: 'Borrado lógico de un presupuesto (JWT + RBAC)',
        description: `Cambia status a "inactive". Un presupuesto APROBADO responde 409. ${SIN_AUTH}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Presupuesto desactivado', 'PresupuestoResponse'), '400': badRequest, '404': notFound, '409': conflicto },
      },
    },
  }),
  components: {
    schemas: {
      Presupuesto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          campania_id: { type: 'integer', example: 1 },
          fecha: { type: 'string', format: 'date-time' },
          valor: { type: 'number', example: 10000000 },
          estado: { type: 'string', enum: [...ESTADOS_PRESUPUESTO], example: 'BORRADOR' },
          observaciones: { type: 'string', nullable: true },
          status: { type: 'string', enum: [...STATUS_PRESUPUESTO], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PresupuestoInput: {
        type: 'object',
        required: ['campania_id', 'valor'],
        properties: {
          campania_id: { type: 'integer', description: 'Id de una campaña existente y activa', example: 1 },
          fecha: { type: 'string', format: 'date-time', description: 'Por defecto, ahora' },
          valor: { type: 'number', exclusiveMinimum: 0, example: 10000000 },
          estado: { type: 'string', enum: [...ESTADOS_PRESUPUESTO], default: 'BORRADOR' },
          observaciones: { type: 'string', example: 'Presupuesto neto de la campaña' },
          status: { type: 'string', enum: [...STATUS_PRESUPUESTO], default: 'active' },
        },
      },
      PresupuestoPatch: {
        type: 'object',
        properties: {
          campania_id: { type: 'integer' },
          fecha: { type: 'string', format: 'date-time' },
          valor: { type: 'number', exclusiveMinimum: 0 },
          estado: { type: 'string', enum: [...ESTADOS_PRESUPUESTO] },
          observaciones: { type: 'string' },
          status: { type: 'string', enum: [...STATUS_PRESUPUESTO] },
        },
      },
      PresupuestoResponse: {
        type: 'object',
        properties: { presupuesto: { $ref: '#/components/schemas/Presupuesto' } },
      },
      PresupuestoList: {
        type: 'object',
        properties: { presupuestos: { type: 'array', items: { $ref: '#/components/schemas/Presupuesto' } } },
      },
    },
  },
};
