import { Entregable } from '../entregables/entregable.model';
import { VersionEntregable } from './version-entregable.model';

Entregable.hasMany(VersionEntregable, { foreignKey: 'entregable_id', as: 'versiones', onDelete: 'RESTRICT' });
VersionEntregable.belongsTo(Entregable, { foreignKey: 'entregable_id', as: 'entregable', onDelete: 'RESTRICT' });
