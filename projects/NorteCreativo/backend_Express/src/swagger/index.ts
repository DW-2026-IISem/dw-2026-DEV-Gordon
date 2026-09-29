import { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { clienteSwagger } from '../features/business/cliente/cliente.swagger';
import { SwaggerModule } from './types';

// Para documentar un feature nuevo basta con agregar su módulo a esta lista.
const modules: SwaggerModule[] = [clienteSwagger];

const buildSpec = () => ({
  openapi: '3.0.3',
  info: {
    title: 'Norte Creativo API',
    version: '1.0.0',
    description: 'API REST de Norte Creativo (Express + TypeScript). Endpoints documentados SIN AUTH.',
  },
  servers: [{ url: 'http://localhost:3012', description: 'Servidor local' }],
  tags: modules.flatMap((m) => m.tags),
  paths: Object.assign({}, ...modules.map((m) => m.paths)),
  components: {
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
