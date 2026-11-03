import { Campania } from '../campanias/campania.model';
import { Presupuesto } from './presupuesto.model';

Campania.hasMany(Presupuesto, { foreignKey: 'campania_id', as: 'presupuestos', onDelete: 'RESTRICT' });
Presupuesto.belongsTo(Campania, { foreignKey: 'campania_id', as: 'campania', onDelete: 'RESTRICT' });
