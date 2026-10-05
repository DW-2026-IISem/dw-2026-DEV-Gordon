import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const ESTADOS_ENTREGABLE = ['EN_PROCESO', 'ENTREGADO'] as const;
export const STATUS_ENTREGABLE = ['active', 'inactive'] as const;

export class Entregable extends Model<InferAttributes<Entregable>, InferCreationAttributes<Entregable>> {
  declare id: CreationOptional<number>;
  declare tarea_id: number;
  declare fecha_inicio: Date | null;
  declare fecha_fin: Date | null;
  declare total: number | null;
  declare estado: CreationOptional<(typeof ESTADOS_ENTREGABLE)[number]>;
  declare observaciones: string | null;
  declare status: CreationOptional<(typeof STATUS_ENTREGABLE)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Entregable.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tarea_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'tareas', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: { isDate: true },
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: { isDate: true },
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: { isDecimal: true, min: 0 },
      // Los drivers devuelven DECIMAL como string: se responde siempre como Number.
      get() {
        const valor = this.getDataValue('total') as unknown;
        return valor === null || valor === undefined ? null : Number(valor);
      },
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_ENTREGABLE),
      allowNull: false,
      defaultValue: 'EN_PROCESO',
      validate: { isIn: [[...ESTADOS_ENTREGABLE]] },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_ENTREGABLE),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...STATUS_ENTREGABLE]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'entregables',
    timestamps: true,
  }
);
