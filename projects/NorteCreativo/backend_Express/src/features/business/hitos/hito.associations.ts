import { Campania } from '../campanias/campania.model';
import { Hito } from './hito.model';

Campania.hasMany(Hito, { foreignKey: 'campania_id', onDelete: 'RESTRICT' });
Hito.belongsTo(Campania, { foreignKey: 'campania_id', as: 'campania', onDelete: 'RESTRICT' });
