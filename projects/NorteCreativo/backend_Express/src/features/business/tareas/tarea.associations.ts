import { Hito } from '../hitos/hito.model';
import { Tarea } from './tarea.model';

Hito.hasMany(Tarea, { foreignKey: 'hito_id', as: 'tareas', onDelete: 'RESTRICT' });
Tarea.belongsTo(Hito, { foreignKey: 'hito_id', as: 'hito', onDelete: 'RESTRICT' });
