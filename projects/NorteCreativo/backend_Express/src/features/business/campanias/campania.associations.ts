import { Cliente } from '../clientes/cliente.model';
import { Campania } from './campania.model';

Cliente.hasMany(Campania, { foreignKey: 'cliente_id', onDelete: 'RESTRICT' });
Campania.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente', onDelete: 'RESTRICT' });
