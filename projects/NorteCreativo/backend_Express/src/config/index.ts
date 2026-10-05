import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from '../routes';
import { sequelize, testConnection } from '../database/db';
import { setupSwagger } from '../swagger';
import '../features/business/campanias/campania.associations';
import '../features/business/hitos/hito.associations';
import '../features/business/tareas/tarea.associations';
import '../features/business/entregables/entregable.associations';
import '../features/business/version-entregables/version-entregable.associations';
import '../features/business/aprobaciones/aprobacion.associations';
import '../features/auth/users/user.model';
import '../features/auth/roles/role.model';
import '../features/auth/resources/resource.model';
import '../features/auth/role-users/role-user.model';
import '../features/auth/resource-roles/resource-role.model';
import '../features/auth/refresh-tokens/refresh-token.model';
import '../features/auth/rbac.associations';

dotenv.config();

export class App {
  private app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3012;

    this.settings();
    this.middlewares();
    this.docs();
    this.routes();
    void this.dbConnection();
  }

  private settings(): void {
    this.app.set('port', this.port);
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private docs(): void {
    setupSwagger(this.app);
  }

  private routes(): void {
    this.app.use('/api', routes);
  }

  private async dbConnection(): Promise<void> {
    if (!(await testConnection())) return;
    try {
      await sequelize.sync();
      console.log('Modelos sincronizados con la base de datos');
    } catch (error) {
      console.error('Error al sincronizar modelos:', error instanceof Error ? error.message : error);
    }
  }

  public listen(): void {
    this.app.listen(this.app.get('port'), () => {
      console.log(`Servidor ejecutándose en puerto ${this.app.get('port')}`);
    });
  }
}
