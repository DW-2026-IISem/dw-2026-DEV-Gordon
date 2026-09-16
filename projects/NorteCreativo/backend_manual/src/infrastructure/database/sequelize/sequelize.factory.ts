import { Sequelize } from 'sequelize-typescript';
import { getDbBlock } from '../../../config/environment/db-env.js';
import { IEnvConfig } from '../../../config/environment/env.interface.js';
import { ClienteModel } from '../../../features/business/clientes/infrastructure/persistence/models/cliente.model.js';
import { CampaniaModel } from '../../../features/business/campanias/infrastructure/persistence/models/campania.model.js';
import { HitoModel } from '../../../features/business/hitos/infrastructure/persistence/models/hito.model.js';
import { TareaModel } from '../../../features/business/tareas/infrastructure/persistence/models/tarea.model.js';

// Los modelos se van agregando aquí a medida que se crea cada feature

export const ALL_MODELS: any[] = [
  ClienteModel,
  CampaniaModel,
  HitoModel,
  TareaModel,
];

export function sequelizeFactory(cfg: IEnvConfig): Sequelize {
  const block = getDbBlock(cfg);
  const options: Record<string, unknown> = {
    dialect: cfg.dbDialect,
    host: block.host,
    port: block.port,
    username: block.username,
    password: block.password,
    database: block.name,
    models: ALL_MODELS,
    logging: false,
  };
  if (cfg.dbDialect === 'oracle' && block.connectString) {
    options.connectString = block.connectString;
  }
  return new Sequelize(options);
}
