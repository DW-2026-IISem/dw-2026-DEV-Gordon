import { SwaggerModule } from '../../../swagger/types';
import { autenticarPaths } from '../../../shared/http/swagger-security';
import { STATUS_REFRESH_TOKEN } from './refresh-token.model';

const JWT = "Modalidad JWT: requiere 'Authorization: Bearer <access token>' (sin RBAC). Solo opera sobre las sesiones del propio usuario.";

const jsonResponse = (description: string, schema: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } },
});
const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id numérico de la sesión',
  schema: { type: 'integer', minimum: 1, example: 1 },
};
const badId = jsonResponse('El id no es un entero positivo', 'SesionError');
const notFound = jsonResponse('Sesión no encontrada (o pertenece a otro usuario)', 'SesionError');

export const sesionesSwagger: SwaggerModule = {
  tags: [
    {
      name: 'Sesiones',
      description: `Sesiones propias (refresh tokens opacos; en la base solo se guarda el hash). ${JWT}`,
    },
  ],
  paths: autenticarPaths({
    '/api/sesiones': {
      get: {
        tags: ['Sesiones'],
        summary: 'Listar mis sesiones activas (JWT)',
        description: `Solo las sesiones activas del usuario autenticado; nunca trae token_hash. ${JWT}`,
        responses: { '200': jsonResponse('Mis sesiones activas', 'SesionList') },
      },
      delete: {
        tags: ['Sesiones'],
        summary: 'Eliminar mis sesiones revocadas o vencidas (JWT)',
        description: `Borrado físico de las sesiones propias ya revocadas o vencidas. ${JWT}`,
        responses: { '200': jsonResponse('Cuántas se eliminaron', 'SesionesEliminadas') },
      },
    },
    '/api/sesiones/deactivate-all': {
      patch: {
        tags: ['Sesiones'],
        summary: 'Revocar todas mis sesiones (JWT)',
        description: `Pasa a "inactive" todas las sesiones activas del usuario autenticado. ${JWT}`,
        responses: { '200': jsonResponse('Cuántas se revocaron', 'SesionesRevocadas') },
      },
    },
    '/api/sesiones/{id}': {
      get: {
        tags: ['Sesiones'],
        summary: 'Obtener una de mis sesiones (JWT)',
        description: `Una sesión ajena responde 404 (no se revela su existencia). ${JWT}`,
        parameters: [idParam],
        responses: { '200': jsonResponse('Sesión encontrada', 'SesionResponse'), '400': badId, '404': notFound },
      },
    },
    '/api/sesiones/{id}/deactivate': {
      patch: {
        tags: ['Sesiones'],
        summary: 'Revocar una de mis sesiones (JWT)',
        description: `Pasa a "inactive" y fija revoked_at. 404 si no existe o es de otro usuario; 409 si ya estaba revocada. ${JWT}`,
        parameters: [idParam],
        responses: {
          '200': jsonResponse('Sesión revocada', 'SesionRevocada'),
          '400': badId,
          '404': notFound,
          '409': jsonResponse('La sesión ya estaba revocada', 'SesionError'),
        },
      },
    },
  }),
  components: {
    schemas: {
      Sesion: {
        type: 'object',
        description: 'Nunca incluye token_hash',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 2 },
          family_id: { type: 'string', format: 'uuid', description: 'Cadena de rotaciones de un mismo inicio de sesión' },
          device_info: { type: 'string', nullable: true, example: 'dev-session' },
          expires_at: { type: 'string', format: 'date-time' },
          revoked_at: { type: 'string', format: 'date-time', nullable: true },
          status: { type: 'string', enum: [...STATUS_REFRESH_TOKEN], example: 'active' },
          is_expired: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SesionResponse: { type: 'object', properties: { sesion: { $ref: '#/components/schemas/Sesion' } } },
      SesionRevocada: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Sesión revocada' }, sesion: { $ref: '#/components/schemas/Sesion' } },
      },
      SesionList: { type: 'object', properties: { sesiones: { type: 'array', items: { $ref: '#/components/schemas/Sesion' } } } },
      SesionesRevocadas: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Sesiones revocadas' }, revocadas: { type: 'integer', example: 2 } },
      },
      SesionesEliminadas: {
        type: 'object',
        properties: { message: { type: 'string' }, eliminadas: { type: 'integer', example: 3 } },
      },
      SesionError: { type: 'object', properties: { message: { type: 'string', example: 'Sesión no encontrada' } } },
    },
  },
};
