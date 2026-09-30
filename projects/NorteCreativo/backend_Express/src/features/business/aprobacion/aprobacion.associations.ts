import { VersionEntregable } from '../version-entregable/version-entregable.model';
import { Aprobacion } from './aprobacion.model';

VersionEntregable.hasMany(Aprobacion, { foreignKey: 'version_entregable_id', as: 'aprobaciones', onDelete: 'RESTRICT' });
Aprobacion.belongsTo(VersionEntregable, { foreignKey: 'version_entregable_id', as: 'version', onDelete: 'RESTRICT' });
