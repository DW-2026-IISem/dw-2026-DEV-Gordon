import { SwaggerModule } from '../../../swagger/types';
import { protegerPaths } from '../../../shared/http/swagger-security';
import { ESTADOS_FACTURA, STATUS_FACTURA } from './factura.model';

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

// Los schemas Error, ValidationError y Campania los aportan los módulos de cliente y campaña.
export const facturaSwagger: SwaggerModule = {
  tags: [
    {
      name: 'Facturas',
      description: `FacturarHitos: factura en una sola transacción los hitos CERRADOS de una campaña (pasan a FACTURADO) sin exceder el presupuesto aprobado (RN-03). Registro contable: sin PUT, PATCH ni DELETE. ${SIN_AUTH}`,
    },
  ],
  paths: protegerPaths({
    '/api/facturas': {
      get: {
        tags: ['Facturas'],
        summary: 'Listar facturas (JWT + RBAC)',
        description: `Filtro opcional ?campania_id=. ${SIN_AUTH}`,
        parameters: [
          { name: 'campania_id', in: 'query', required: false, description: 'Filtra por campaña', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': jsonResponse('Listado de facturas', 'FacturaList'),
          '400': jsonResponse('campania_id no es un entero positivo', 'ValidationError'),
        },
      },
      post: {
        tags: ['Facturas'],
        summary: 'FacturarHitos: facturar hitos cerrados (JWT + RBAC)',
        description:
          'En una sola transacción: campaña con presupuesto APROBADO (404/409); hitos existentes (404), de la campaña (400) y CERRADOS (409), bloqueados con LOCK.UPDATE; ' +
          'valor de cada hito = suma de entregables.total de sus tareas; impuestos = subtotal × FACTURA_IVA (default 0.19); RN-03 sobre el subtotal (409); número NC-<año>-<consecutivo de 6 dígitos> (RN-07). ' +
          `Los hitos pasan a FACTURADO. Cualquier error revierte todo. ${SIN_AUTH}`,
        requestBody: jsonBody('FacturaInput', 'Campaña y hitos a facturar'),
        responses: {
          '201': jsonResponse('Factura emitida', 'FacturarHitosResponse'),
          '400': jsonResponse('Body inválido, hito_ids vacío o hito de otra campaña', 'ValidationError'),
          '404': jsonResponse('Campaña u hito inexistente', 'Error'),
          '409': jsonResponse('Sin presupuesto aprobado, hito no CERRADO / ya FACTURADO, o RN-03 excedida', 'Error'),
        },
      },
    },
    '/api/facturas/{id}': {
      get: {
        tags: ['Facturas'],
        summary: 'Obtener una factura con sus hitos (JWT + RBAC)',
        description: SIN_AUTH,
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Id numérico de la factura', schema: { type: 'integer', minimum: 1, example: 1 } },
        ],
        responses: {
          '200': jsonResponse('Factura con sus hitos', 'FacturaDetalleResponse'),
          '400': jsonResponse('El id no es un entero positivo', 'ValidationError'),
          '404': jsonResponse('Factura no encontrada', 'Error'),
        },
      },
    },
  }),
  components: {
    schemas: {
      Factura: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          campania_id: { type: 'integer', example: 1 },
          numero: { type: 'string', example: 'NC-2026-000001' },
          fecha: { type: 'string', format: 'date-time' },
          subtotal: { type: 'number', example: 1000000 },
          impuestos: { type: 'number', example: 190000 },
          total: { type: 'number', example: 1190000 },
          estado: { type: 'string', enum: [...ESTADOS_FACTURA], example: 'EMITIDA' },
          status: { type: 'string', enum: [...STATUS_FACTURA], example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      FacturaHito: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          factura_id: { type: 'integer' },
          hito_id: { type: 'integer' },
          valor: { type: 'number', example: 1000000 },
        },
      },
      FacturaInput: {
        type: 'object',
        required: ['campania_id', 'hito_ids'],
        properties: {
          campania_id: { type: 'integer', example: 1 },
          hito_ids: { type: 'array', minItems: 1, items: { type: 'integer', minimum: 1 }, example: [1, 2] },
        },
      },
      FacturarHitosResponse: {
        type: 'object',
        properties: {
          factura: { $ref: '#/components/schemas/Factura' },
          hitos: {
            type: 'array',
            items: { type: 'object', properties: { hito_id: { type: 'integer' }, valor: { type: 'number' } } },
          },
          presupuesto_aprobado: { type: 'number', example: 10000000 },
          total_facturado_campania: { type: 'number', description: 'Suma de subtotales facturados de la campaña, incluida esta factura', example: 1000000 },
        },
      },
      FacturaDetalleResponse: {
        type: 'object',
        properties: {
          factura: {
            allOf: [
              { $ref: '#/components/schemas/Factura' },
              {
                type: 'object',
                properties: {
                  hitos: { type: 'array', items: { $ref: '#/components/schemas/FacturaHito' } },
                  campania: { $ref: '#/components/schemas/Campania' },
                },
              },
            ],
          },
        },
      },
      FacturaList: {
        type: 'object',
        properties: { facturas: { type: 'array', items: { $ref: '#/components/schemas/Factura' } } },
      },
    },
  },
};
