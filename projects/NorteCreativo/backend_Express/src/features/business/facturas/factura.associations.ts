import { Campania } from '../campanias/campania.model';
import { Hito } from '../hitos/hito.model';
import { FacturaHito } from './factura-hito.model';
import { Factura } from './factura.model';

Campania.hasMany(Factura, { foreignKey: 'campania_id', as: 'facturas', onDelete: 'RESTRICT' });
Factura.belongsTo(Campania, { foreignKey: 'campania_id', as: 'campania', onDelete: 'RESTRICT' });
Factura.hasMany(FacturaHito, { foreignKey: 'factura_id', as: 'hitos', onDelete: 'RESTRICT' });
FacturaHito.belongsTo(Factura, { foreignKey: 'factura_id', as: 'factura', onDelete: 'RESTRICT' });
Hito.hasMany(FacturaHito, { foreignKey: 'hito_id', as: 'facturaHitos', onDelete: 'RESTRICT' });
FacturaHito.belongsTo(Hito, { foreignKey: 'hito_id', as: 'hito', onDelete: 'RESTRICT' });
