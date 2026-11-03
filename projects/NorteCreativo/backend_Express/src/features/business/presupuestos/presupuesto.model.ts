import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const ESTADOS_PRESUPUESTO = ['BORRADOR', 'APROBADO'] as const;
export const STATUS_PRESUPUESTO = ['active', 'inactive'] as const;

export class Presupuesto extends Model<InferAttributes<Presupuesto>, InferCreationAttributes<Presupuesto>> {
  declare id: CreationOptional<number>;
  declare campania_id: number;
  declare fecha: CreationOptional<Date>;
  declare valor: number;
  declare estado: CreationOptional<(typeof ESTADOS_PRESUPUESTO)[number]>;
  declare observaciones: string | null;
  declare status: CreationOptional<(typeof STATUS_PRESUPUESTO)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Presupuesto.init(
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
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: { isDate: true },
    },
    valor: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      validate: { isDecimal: true, min: { args: [0.01], msg: 'valor debe ser mayor que 0' } },
      // Los drivers devuelven DECIMAL como string: se responde siempre como Number.
      get() {
        return Number(this.getDataValue('valor') as unknown);
      },
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_PRESUPUESTO),
      allowNull: false,
      defaultValue: 'BORRADOR',
      validate: { isIn: [[...ESTADOS_PRESUPUESTO]] },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_PRESUPUESTO),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...STATUS_PRESUPUESTO]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'presupuestos',
    timestamps: true,
  }
);
