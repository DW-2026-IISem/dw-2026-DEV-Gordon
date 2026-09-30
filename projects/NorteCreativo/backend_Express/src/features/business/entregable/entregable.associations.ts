import { Tarea } from '../tarea/tarea.model';
import { Entregable } from './entregable.model';

Tarea.hasMany(Entregable, { foreignKey: 'tarea_id', as: 'entregables', onDelete: 'RESTRICT' });
Entregable.belongsTo(Tarea, { foreignKey: 'tarea_id', as: 'tarea', onDelete: 'RESTRICT' });
