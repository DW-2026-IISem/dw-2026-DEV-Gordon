import { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { clienteSwagger } from '../features/business/clientes/cliente.swagger';
import { campaniaSwagger } from '../features/business/campanias/campania.swagger';
import { hitoSwagger } from '../features/business/hitos/hito.swagger';
import { tareaSwagger } from '../features/business/tareas/tarea.swagger';
import { entregableSwagger } from '../features/business/entregables/entregable.swagger';
import { versionEntregableSwagger } from '../features/business/version-entregables/version-entregable.swagger';
import { aprobacionSwagger } from '../features/business/aprobaciones/aprobacion.swagger';
import { usersSwagger } from '../features/auth/users/users.swagger';
import { rolesSwagger } from '../features/auth/roles/roles.swagger';
import { resourcesSwagger } from '../features/auth/resources/resources.swagger';
import { roleUsersSwagger } from '../features/auth/role-users/role-users.swagger';
import { resourceRolesSwagger } from '../features/auth/resource-roles/resource-roles.swagger';
import { bearerSecurityScheme } from '../shared/http/swagger-security';
import { sesionesSwagger } from '../features/auth/refresh-tokens/refresh-tokens.swagger';
import { sessionSwagger } from '../features/auth/session/session.swagger';
import { SwaggerModule } from './types';

// Para documentar un feature nuevo basta con agregar su módulo a esta lista.
const modules: SwaggerModule[] = [clienteSwagger, campaniaSwagger, hitoSwagger, tareaSwagger, entregableSwagger, versionEntregableSwagger, aprobacionSwagger, usersSwagger, rolesSwagger, resourcesSwagger, roleUsersSwagger, resourceRolesSwagger, sesionesSwagger, sessionSwagger];

const buildSpec = () => ({
  openapi: '3.0.3',
  info: {
    title: 'Norte Creativo API',
    version: '1.0.0',
    description:
      'API REST de Norte Creativo (Express + TypeScript). Modalidades de acceso: OPEN (sin credencial), JWT y JWT + RBAC. Hoy: JWT + RBAC en usuarios, roles, recursos, asignaciones-rol y concesiones-rol; solo JWT en sesiones, perfil y permisos propios; OPEN en login, refresh y logout; el negocio sigue SIN AUTH hasta ISS-21.',
  },
  servers: [{ url: 'http://localhost:3012', description: 'Servidor local' }],
  tags: modules.flatMap((m) => m.tags),
  paths: Object.assign({}, ...modules.map((m) => m.paths)),
  components: {
    securitySchemes: { bearerAuth: bearerSecurityScheme },
    schemas: Object.assign({}, ...modules.map((m) => m.components.schemas)),
  },
});

export const setupSwagger = (app: Application): void => {
  const spec = buildSpec();

  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.status(200).json(spec);
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
};
