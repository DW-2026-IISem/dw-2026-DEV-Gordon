import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const ESTADOS_FACTURA = ['EMITIDA'] as const;
export const STATUS_FACTURA = ['active', 'inactive'] as const;

// Los drivers devuelven DECIMAL como string: se responde siempre como Number.
const decimal = (campo: 'subtotal' | 'impuestos' | 'total') => ({
  type: DataTypes.DECIMAL(14, 2),
  allowNull: false,
  validate: { isDecimal: true, min: 0 },
  get(this: Factura) {
    return Number(this.getDataValue(campo) as unknown);
  },
});

export class Factura extends Model<InferAttributes<Factura>, InferCreationAttributes<Factura>> {
  declare id: CreationOptional<number>;
  declare campania_id: number;
  declare numero: string;
  declare fecha: CreationOptional<Date>;
  declare subtotal: number;
  declare impuestos: number;
  declare total: number;
  declare estado: CreationOptional<(typeof ESTADOS_FACTURA)[number]>;
  declare status: CreationOptional<(typeof STATUS_FACTURA)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Factura.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    campania_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'campanias', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    // RN-07: el número de factura es único (índice único en la base).
    numero: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subtotal: decimal('subtotal'),
    impuestos: decimal('impuestos'),
    total: decimal('total'),
    estado: {
      type: DataTypes.ENUM(...ESTADOS_FACTURA),
      allowNull: false,
      defaultValue: 'EMITIDA',
      validate: { isIn: [[...ESTADOS_FACTURA]] },
    },
    status: {
      type: DataTypes.ENUM(...STATUS_FACTURA),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...STATUS_FACTURA]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'facturas',
    timestamps: true,
  }
);
