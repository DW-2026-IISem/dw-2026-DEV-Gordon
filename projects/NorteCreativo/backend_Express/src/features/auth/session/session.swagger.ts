import { SwaggerModule } from '../../../swagger/types';
import { autenticarPaths } from '../../../shared/http/swagger-security';

const json = (schema: string) => ({ 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } });
const respuesta = (description: string, schema: string) => ({ description, content: json(schema) });
const cuerpo = (schema: string, description: string) => ({ required: true, description, content: json(schema) });

const invalido = respuesta('Faltan campos o no son texto', 'AuthValidationError');
const noAutorizado = respuesta('Credenciales o refresh token inválidos', 'AuthError');

// Rutas OPEN: security: [] las marca explícitamente sin credencial de acceso (la credencial viaja en el body).
const abiertas = {
  '/api/sesion/login': {
    post: {
      tags: ['Autenticación'],
      summary: 'Iniciar sesión (OPEN)',
      description:
        'identifier = username o email. Credenciales incorrectas, usuario inexistente y usuario inactivo responden 401 con el MISMO mensaje. Devuelve access token (JWT) y refresh token opaco.',
      security: [],
      requestBody: cuerpo('LoginInput', 'identifier y password'),
      responses: { '200': respuesta('Sesión iniciada', 'SessionTokens'), '400': invalido, '401': noAutorizado },
    },
  },
  '/api/sesion/refresh': {
    post: {
      tags: ['Autenticación'],
      summary: 'Renovar la sesión con rotación (OPEN)',
      description:
        'Invalida el refresh token enviado y entrega un par nuevo. Reusar un refresh ya rotado responde 401 y revoca toda la familia de la sesión.',
      security: [],
      requestBody: cuerpo('RefreshInput', 'refresh_token'),
      responses: { '200': respuesta('Par de tokens nuevo', 'SessionTokens'), '400': invalido, '401': noAutorizado },
    },
  },
  '/api/sesion/logout': {
    post: {
      tags: ['Autenticación'],
      summary: 'Cerrar la sesión (OPEN)',
      description: 'Revoca el refresh token enviado. Idempotente: un token desconocido o ya revocado también responde 200.',
      security: [],
      requestBody: cuerpo('RefreshInput', 'refresh_token'),
      responses: { '200': respuesta('Sesión cerrada', 'AuthMessage'), '400': invalido },
    },
  },
};

// Modalidad JWT: solo authenticate (sin RBAC).
const jwt = autenticarPaths({
  '/api/sesion/perfil': {
    get: {
      tags: ['Autenticación'],
      summary: 'Mi perfil (JWT)',
      description: 'Datos públicos del usuario autenticado (nunca password) y sus roles activos.',
      responses: { '200': respuesta('Perfil con roles', 'ProfileResponse') },
    },
  },
  '/api/permisos': {
    get: {
      tags: ['Autenticación'],
      summary: 'Mis permisos efectivos (JWT)',
      description:
        'Concesiones activas del usuario autenticado (cadena user → role_users → roles → resource_roles → resources, todo activo), sin duplicados y con los roles que las otorgan. Herramienta de depuración RBAC.',
      responses: { '200': respuesta('Permisos efectivos', 'PermissionsResponse') },
    },
  },
});

export const sessionSwagger: SwaggerModule = {
  tags: [
    {
      name: 'Autenticación',
      description: 'Login, refresh con rotación, logout, perfil y permisos propios. login/refresh/logout son OPEN; perfil y permisos son JWT.',
    },
  ],
  paths: { ...abiertas, ...jwt },
  components: {
    schemas: {
      LoginInput: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', description: 'username o email', example: 'admin' },
          password: { type: 'string', format: 'password', example: 'Admin123!' },
        },
      },
      RefreshInput: {
        type: 'object',
        required: ['refresh_token'],
        properties: { refresh_token: { type: 'string', description: 'Refresh token opaco recibido en login o refresh' } },
      },
      SessionTokens: {
        type: 'object',
        properties: {
          access_token: { type: 'string', description: 'JWT HS256 de vida corta' },
          token_type: { type: 'string', example: 'Bearer' },
          expires_in: { type: 'integer', description: 'segundos de vida del access token', example: 900 },
          refresh_token: { type: 'string', description: 'Opaco; solo se muestra esta vez (en la base queda su hash)' },
          refresh_expires_in: { type: 'integer', description: 'segundos de vida del refresh token', example: 604800 },
        },
      },
      ProfileResponse: {
        type: 'object',
        properties: {
          usuario: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 2 },
              username: { type: 'string', example: 'admin' },
              email: { type: 'string', example: 'admin@norte-creativo.example' },
              status: { type: 'string', example: 'active' },
              roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { id: { type: 'integer' }, name: { type: 'string', example: 'ADMIN' }, description: { type: 'string', nullable: true } },
                },
              },
            },
          },
        },
      },
      PermissionsResponse: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 76 },
          permisos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                method: { type: 'string', example: 'GET' },
                path: { type: 'string', example: '/api/clientes' },
                roles: { type: 'array', items: { type: 'string' }, example: ['ADMIN'] },
              },
            },
          },
        },
      },
      AuthMessage: { type: 'object', properties: { message: { type: 'string', example: 'Sesión cerrada' } } },
      AuthError: { type: 'object', properties: { message: { type: 'string', example: 'Credenciales inválidas' } } },
      AuthValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error de validación' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};
