import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const ESTADOS_HITO = ['ABIERTO', 'CERRADO', 'FACTURADO'] as const;
export const STATUS_HITO = ['active', 'inactive'] as const;

export class Hito extends Model<InferAttributes<Hito>, InferCreationAttributes<Hito>> {
  declare id: CreationOptional<number>;
  declare campania_id: number;
  declare nombre: string;
  declare descripcion: string | null;
  declare estado: CreationOptional<(typeof ESTADOS_HITO)[number]>;
  declare fecha_cierre: Date | null;
  declare status: CreationOptional<(typeof STATUS_HITO)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Hito.init(
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
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_HITO),
      allowNull: false,
      defaultValue: 'ABIERTO',
      validate: { isIn: [[...ESTADOS_HITO]] },
    },
    fecha_cierre: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_HITO),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...STATUS_HITO]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'hitos',
    timestamps: true,
  }
);
